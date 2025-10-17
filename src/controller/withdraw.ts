

import userModel from "@/model/user";
import withdrawModel from "@/model/withdraw";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
import { increaseBalance } from "./user";
import balanceTransactionModel from "@/model/balanceTransaction";
import depositModel from "@/model/deposit";
import axios from "axios";
import { NATHAN_ADDRESS, solana_connection, VAULT_PRIV_KEYS } from "@/utils";

import * as bitcoin from "bitcoinjs-lib"
import ECPairFactory from "ecpair"
import * as ecc from "tiny-secp256k1"
import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import bs58 from 'bs58';
type UtxoType = {
    tx_hash_big_endian: string,
    tx_output_n: number,
    script: string,
    value: number,
    confirmations: number,
}
export async function getVaultBalance({ network }: { network: string }) {
    if (network === "Bitcoin") {
        const ECPair = ECPairFactory(ecc);
        const vault_address = bitcoin.payments.p2wpkh({ pubkey: ECPair.fromWIF(VAULT_PRIV_KEYS.btc).publicKey }).address
        if (!vault_address) throw new Error("Error in retrieving vault address")
        const { data: { price: lockedPrice } }: { data: { price: number } } = await axios.get("https://data-api.binance.vision/api/v3/ticker/price?symbol=BTCUSDT")
        const { data: { unspent_outputs } }: { data: { unspent_outputs: UtxoType[] } } =
            await axios.get(`https://blockchain.info/unspent?active=${vault_address}&confirmations=3&limit=1000`)
        const vaultBalance = unspent_outputs.reduce((prev, cur) => (prev + cur.value), 0)
        return { lockedPrice, vaultBalance }
    }
    if (network === "Solana") {
        const keypair = Keypair.fromSecretKey(bs58.decode(VAULT_PRIV_KEYS.sol))
        const vaultBalance = await solana_connection.getBalance(keypair.publicKey)
        const { data: { price: lockedPrice } }: { data: { price: number } } = await axios.get("https://data-api.binance.vision/api/v3/ticker/price?symbol=SOLUSDT")
        return { lockedPrice, vaultBalance }
    }
    return { lockedPrice: 0, vaultBalance: 0 }
}
export async function createWithdraw({ username, currency, network, address, amount }: { username: string, currency: string, network: string, address: string, amount: number }) {
    await connectMongoDB()
    try {
        const { lockedPrice, vaultBalance } = await getVaultBalance({ network })
        let result = "pending"
        let tx = "undefined"
        let reason = "Insufficient vault balance"
        const amount_satlamp = Math.ceil(amount * 0.99 *
            (network === "Bitcoin" ? 10 ** 8 :
                network === "Solana" ? LAMPORTS_PER_SOL
                    : 1)
            / lockedPrice)
        if (vaultBalance >= amount_satlamp) {
            const viewPoint = new Date(new Date().getTime() - 20 * 60 * 60 * 1000);
            const sumFromPoint = await withdrawModel.aggregate([
                {
                    $match: {
                        username,
                        result: "success",
                        updatedAt: {
                            $gte: viewPoint,
                        }
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ])
            if ((sumFromPoint?.[0]?.total || 0) + amount <= 50) {
                result = "success"
                tx = network === "Bitcoin" ? await transferBTC({ address, amount_satoshi: amount_satlamp }) :
                    network === "Solana" ? await transferSOL({ address, amount_lamp: amount_satlamp }) :
                        ""
                reason = ""
            } else {
                reason = "Exceeds $50 within 20 hours"
            }
        }
        const newWithdraw = new withdrawModel({
            username, currency, network, address, amount, lockedPrice,
            tx,
            result,
            reason,
        });

        const savedWithdraw = await newWithdraw.save();
        if (result === "success") {
            postprocessWithdraw({ id: savedWithdraw._id, tx, network })
        }
        return savedWithdraw;
    } catch (error) {
        console.error('Error creating withdraw:', error);
        throw error
    }
}
async function transferBTC({ address, amount_satoshi }: { address: string, amount_satoshi: number }) {
    try {
        const ECPair = ECPairFactory(ecc);
        const keypair = ECPair.fromWIF(VAULT_PRIV_KEYS.btc);
        const vault_address = bitcoin.payments.p2wpkh({ pubkey: keypair.publicKey }).address
        if (!vault_address) throw new Error("Error in retrieving vault address")
        const network = bitcoin.networks.bitcoin;
        const { data: { unspent_outputs } }: { data: { unspent_outputs: UtxoType[] } } =
            await axios.get(`https://blockchain.info/unspent?active=${vault_address}&confirmations=3&limit=1000`)
        const psbt = new bitcoin.Psbt({ network })

        unspent_outputs.sort((a, b) => a.value - b.value)
        let utxo_sum = 0
        for (let utxo of unspent_outputs) {
            utxo_sum += utxo.value
            psbt.addInput({
                hash: utxo.tx_hash_big_endian,
                index: utxo.tx_output_n,
                witnessUtxo: {
                    script: Buffer.from(utxo.script, 'hex'),
                    value: BigInt(utxo.value),
                },
            })
            if (utxo_sum >= amount_satoshi) break
        }

        const { data: feeRates } = await axios.get("https://blockstream.info/api/fee-estimates");
        const feeRate = feeRates['6'] || feeRates['12'] || 1;
        const inputCount = psbt.inputCount;
        const outputCount = 2;
        const estimatedVBytes = 10 + inputCount * 68 + outputCount * 31;
        // 10 is an approximate overhead, adjust if needed.
        const fee = Math.ceil(feeRate * estimatedVBytes);
        const changeAmount = utxo_sum - amount_satoshi

        psbt.addOutput({
            address,
            value: BigInt(amount_satoshi - fee)
        })
        if (changeAmount > 546) {
            psbt.addOutput({
                address: vault_address,
                value: BigInt(changeAmount)
            })
        }
        psbt.signAllInputs(keypair);
        psbt.finalizeAllInputs()
        const txHex = psbt.extractTransaction().toHex()
        const { data }: { data: string } = await axios.post('https://mempool.space/api/tx', txHex, {
            headers: {
                'Content-Type': 'text/plain'
            }
        })
        return data

    } catch (error) {
        console.error('Error transferring BTC:', error);
        throw error
    }
}
async function transferSOL({ address, amount_lamp }: { address: string, amount_lamp: number }) {
    try {
        const keypair = Keypair.fromSecretKey(bs58.decode(VAULT_PRIV_KEYS.sol))
        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: new PublicKey(address),
                lamports: amount_lamp - 5000
            })
        )
        const signature = await sendAndConfirmTransaction(solana_connection, tx, [keypair])
        return signature
    } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
    }
}
export async function findWithdraw(username: string) {
    await connectMongoDB()
    const matchStage = username === "admin" ? {} : { username }
    const withdraw = await withdrawModel.find(matchStage).sort({ createdAt: -1 })
    return withdraw
}
export async function getWithdrawById(id: string) {
    await connectMongoDB()
    try {
        const withdraw = await withdrawModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "users",
                    localField: "username",
                    foreignField: "username",
                    as: "userData"
                }
            },
            {
                $unwind: {
                    path: "$userData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    username: 1,
                    createdAt: 1,
                    reason: 1,
                    amount: 1,
                    result: 1,
                    tx: 1,
                    address: 1,
                    currency: 1,
                    network: 1,
                    lockedPrice: 1,
                    userbalance: "$userData.balance",
                }
            }
        ])
        return withdraw[0]
    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
export async function postprocessWithdraw({ id, tx, network }: { id: string, tx: string, network: string }) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const withdraw = await withdrawModel.findByIdAndUpdate(new mongoose.Types.ObjectId(id), { $set: { result: "success", tx } }, { new: true }).session(session)
        const user = await userModel.findOne({ username: withdraw.username }).session(session);
        const updatedUser = await increaseBalance(withdraw.username, -withdraw.amount, session);
        const newBalance = new balanceTransactionModel({
            username: withdraw.username,
            type: "withdraw",
            amount: withdraw.amount,
            balanceBefore: user.balance,
            balanceAfter: updatedUser.balance,
            withdrawId: new mongoose.Types.ObjectId(id),
            timestamp: new Date(),
            description: tx ? `withdrawal: $${withdraw.amount} through ${tx} on ${network}` : `Withdrawed through gamecurrency`
        })

        const savedBalance = await newBalance.save({ session });
        await session.commitTransaction();
        return withdraw

    } catch (error) {
        console.error('Error processing succeeded withdraw:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}
export async function sweepCoin({ network }: { network: string }) {
    await connectMongoDB()
    const BALANCE_THRESHOLD = 150
    const BALANCE_HOLD = 101
    try {
        const { lockedPrice, vaultBalance } = await getVaultBalance({ network })
        const balance = Math.floor(vaultBalance / 10 ** 8 * lockedPrice * 100) / 100
        if (balance >= BALANCE_THRESHOLD) {
            const transfer_balance = Math.floor(balance - BALANCE_HOLD)
            const address = network === "Bitcoin" ? NATHAN_ADDRESS.btc :
                network === "Solana" ? NATHAN_ADDRESS.sol :
                    ""
            const amount_satlamp = Math.ceil(transfer_balance *
                (network === "Bitcoin" ? 10 ** 8 :
                    network === "Solana" ? LAMPORTS_PER_SOL
                        : 1)
                / lockedPrice)
            const tx = network === "Bitcoin" ? await transferBTC({ address, amount_satoshi: amount_satlamp }) :
                network === "Solana" ? await transferSOL({ address, amount_lamp: amount_satlamp }) :
                    ""
            const newBalance = new balanceTransactionModel({
                username: "admin",
                type: "sweep",
                amount: transfer_balance,
                balanceBefore: 0,
                balanceAfter: 0,
                timestamp: new Date(),
                description: `sweep: $${transfer_balance} from ${network} Vault: tx=${tx}`
            })
            await newBalance.save();
        }
    } catch (error) {
        console.error('Error sweeping', error);
        throw error
    }
}
export async function approveWithdraw({ id }: { id: string }) {
    try {
        const withdraw = await getWithdrawById(id)
        if (withdraw.amount > withdraw.userbalance) {
            throw new Error("Insufficient balance for withdrawal")
        }

        const address = withdraw.address
        const amount_satlamp = Math.ceil(withdraw.amount * 0.99 * (
            withdraw.network === "Bitcoin" ? 10 ** 8 :
                withdraw.network === "Solana" ? LAMPORTS_PER_SOL :
                    0
        ) / withdraw.lockedPrice)
        const tx = withdraw.network === "Bitcoin" ? await transferBTC({ address, amount_satoshi: amount_satlamp }) :
            withdraw.network === "Solana" ? await transferSOL({ address, amount_lamp: amount_satlamp }) :
                ""
        return await postprocessWithdraw({ id, tx, network: withdraw.network })
    } catch (error) {
        console.error('Error in approving withdraw:', error);
        throw error
    }
}
export async function rejectWithdraw({ id, reason }: { id: string, reason: string }) {
    await connectMongoDB()
    try {
        const withdraw = await withdrawModel.findByIdAndUpdate(new mongoose.Types.ObjectId(id), { $set: { result: "failed", reason } }, { new: true })
        return withdraw
    } catch (error) {
        console.error('Error processing reject withdraw:', error);
        throw error
    }
}
export async function compareDeopositVsBet(username: string) {
    await connectMongoDB()
    try {

        const depositVsBet = await depositModel.aggregate([
            {
                $facet: {
                    deposits: [
                        { $match: { username, result: "success" } },
                        { $group: { _id: null, total: { $sum: "$depositAmount" } } }
                    ],
                    bets: [
                        {
                            $lookup: {
                                from: "bets",
                                pipeline: [{ $match: { username } }],
                                as: "betsData"
                            }
                        },
                        { $limit: 1 },
                        { $unwind: { path: "$betsData", preserveNullAndEmptyArrays: true } },
                        { $group: { _id: null, total: { $sum: "$betsData.amount" } } }
                    ]
                }
            },
            {
                $project: {
                    deposit: { $ifNull: [{ $arrayElemAt: ["$deposits.total", 0] }, 0] },
                    bet: { $ifNull: [{ $arrayElemAt: ["$bets.total", 0] }, 0] }
                }
            }
        ])
        return depositVsBet
    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}