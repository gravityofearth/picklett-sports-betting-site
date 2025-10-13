
import balanceTransactionModel from "@/model/balanceTransaction";
import depositModel from "@/model/deposit";
import connectMongoDB from "@/utils/mongodb";
import axios from "axios";
import mongoose from "mongoose";
import { increaseBalance } from "./user";
import userModel from "@/model/user";

import * as bitcoin from "bitcoinjs-lib"
import ECPairFactory from "ecpair"
import * as ecc from "tiny-secp256k1"
import { solana_connection, VAULT_PRIV_KEYS } from "@/utils"
import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'
export async function createDeposit({ username, currency, network }: { username: string, currency: string, network: string }) {
    await connectMongoDB()
    try {
        if (currency === "BTC") {
            const { data: { price: priceBTC } }: { data: { price: number } } = await axios.get("https://data-api.binance.vision/api/v3/ticker/price?symbol=BTCUSDT")
            const ECPair = ECPairFactory(ecc);
            const keyPair = ECPair.makeRandom({ network: bitcoin.networks.bitcoin });
            const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey })
            const newDeposit = new depositModel({
                username, currency, network,
                privateKey: keyPair.toWIF(),
                address,
                depositAmount: 0,
                lockedPrice: priceBTC,
                result: "initiated",
                confirmations: 0,
                expiresAt: new Date().getTime() + 20 * 60 * 1000
            });
            const savedDeposit = await newDeposit.save();
            return savedDeposit;
        }
        if (currency === "SOL") {
            const { data: { price: priceSOL } }: { data: { price: number } } = await axios.get("https://data-api.binance.vision/api/v3/ticker/price?symbol=SOLUSDT")
            const keypair = Keypair.generate()
            const address = keypair.publicKey.toBase58()
            const privateKey = bs58.encode(keypair.secretKey)
            const newDeposit = new depositModel({
                username, currency, network,
                privateKey,
                address,
                depositAmount: 0,
                lockedPrice: priceSOL,
                result: "initiated",
                confirmations: 0,
                expiresAt: new Date().getTime() + 20 * 60 * 1000
            });
            const savedDeposit = await newDeposit.save();
            return savedDeposit;
        }
    } catch (error) {
        console.error('Error creating deposit:', error);
        throw error
    }
}
export async function getDepositById(id: string) {
    await connectMongoDB()
    try {
        const deposit = await depositModel.findById(new mongoose.Types.ObjectId(id))
        return deposit
    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
export async function getMonitoringDeposits() {
    await connectMongoDB()
    try {
        const deposits = await depositModel.find({
            result: { $in: ["initiated", "confirming"] }
        })
        return deposits
    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
export async function updateDeposit({ id, result, depositAmount, confirmations, session }: { id: string, result: string, confirmations?: number, session?: mongoose.mongo.ClientSession, depositAmount?: number }) {
    await connectMongoDB()
    try {
        const deposit = await depositModel.findByIdAndUpdate(new mongoose.Types.ObjectId(id), { $set: { result, depositAmount, confirmations } }, { new: true }).session(session || null)
        return deposit
    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
export async function detectDeposit(deposit: any) {
    let expired = true
    while (deposit.expiresAt + 20 * 60 * 1000 > new Date().getTime()) {
        try {
            if (deposit.network === "Bitcoin") {
                const { data: { unspent_outputs } }: {
                    data: {
                        unspent_outputs: {
                            value: number,
                            confirmations: number,
                        }[]
                    }
                } = await axios.get(`https://blockchain.info/unspent?active=${deposit.address}`)
                if (unspent_outputs.length > 0) {
                    const balance_sat = unspent_outputs.reduce((prev, cur) => prev + cur.value, 0)
                    const depositAmount = Math.floor(balance_sat * deposit.lockedPrice / 10 ** 8 * 100) / 100
                    const confirmations = unspent_outputs.sort((a, b) => a.confirmations - b.confirmations)[0].confirmations
                    await updateDeposit({ id: deposit._id, result: "confirming", confirmations, depositAmount })
                    confirmDeposit(deposit)
                    expired = false
                    break
                }
            }
            if (deposit.network === "Solana") {
                const balance_lamp = await solana_connection.getBalance(new PublicKey(deposit.address))
                const depositAmount = Math.floor(balance_lamp / LAMPORTS_PER_SOL * deposit.lockedPrice * 100) / 100
                if (balance_lamp > 0) {
                    depositSuccess({ id: deposit._id, confirmations: 0, depositAmount })
                    collectDepositSOL(deposit)
                    expired = false
                    break
                }
            }
        } catch (error) {
            console.error('Error detecting deposit:', error);
        }
        await new Promise((res) => setTimeout(res, 30_000))
    }
    if (expired) {
        await updateDeposit({ id: deposit._id, result: "expired" })
    }
}
export async function confirmDeposit(deposit: any) {
    const start_time = new Date().getTime()
    while (start_time + 60 * 60 * 1000 > new Date().getTime()) {
        try {
            const { data: { unspent_outputs } }: {
                data: {
                    unspent_outputs: {
                        value: number,
                        confirmations: number,
                    }[]
                }
            } = await axios.get(`https://blockchain.info/unspent?active=${deposit.address}`)
            if (unspent_outputs.length > 0) {
                const confirmations = unspent_outputs.sort((a, b) => a.confirmations - b.confirmations)[0].confirmations
                if (confirmations < 2 && confirmations !== deposit.confirmations) {
                    await updateDeposit({ id: deposit._id, result: "confirming", confirmations })
                }
                if (confirmations >= 2) {
                    const balance_sat = unspent_outputs.reduce((prev, cur) => prev + cur.value, 0)
                    const depositAmount = Math.floor(balance_sat * deposit.lockedPrice / 10 ** 8 * 100) / 100
                    depositSuccess({ id: deposit._id, confirmations, depositAmount })
                    collectDepositBTC(deposit)
                    break
                }
            }
        } catch (error) {
            console.error('Error confirming deposit:', error);
        }
        await new Promise((res) => setTimeout(res, 2 * 60 * 1000))
    }
}
async function depositSuccess({ id, confirmations, depositAmount }: { id: string, confirmations: number, depositAmount: number }) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { username } = await updateDeposit({
            id, confirmations, result: "success", depositAmount, session
        })
        const user = await userModel.findOne({ username }).session(session);
        const updatedUser = await increaseBalance(username, depositAmount, session);
        const newBalance = new balanceTransactionModel({
            username,
            type: "deposit",
            amount: depositAmount,
            balanceBefore: user.balance,
            balanceAfter: updatedUser.balance,
            depositId: new mongoose.Types.ObjectId(id),
            timestamp: new Date(),
            description: `Deposit: $${depositAmount}`
        })

        const savedBalance = await newBalance.save({ session });
        await session.commitTransaction();

    } catch (error) {
        console.error('Error processing succeeded deposit:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}
export async function findDeposit_no_initiated(username: string) {
    await connectMongoDB()
    const matchStage = username === "admin" ? { result: { $ne: "initiated" } } : { username, result: { $ne: "initiated" } }
    const deposit = await depositModel.find(matchStage).sort({ expiresAt: -1 })
    return deposit
}
async function collectDepositBTC(deposit: any) {
    const { data: { unspent_outputs } }: {
        data: {
            unspent_outputs: {
                tx_hash_big_endian: string,
                tx_output_n: number,
                script: string,
                value: number,
                confirmations: number,
            }[]
        }
    } = await axios.get(`https://blockchain.info/unspent?active=${deposit.address}`)
    const ECPair = ECPairFactory(ecc);
    const keypair = ECPair.fromWIF(deposit.privateKey);
    const network = bitcoin.networks.bitcoin;
    const psbt = new bitcoin.Psbt({ network })
    psbt.addInput({
        hash: unspent_outputs[0].tx_hash_big_endian,
        index: unspent_outputs[0].tx_output_n,
        witnessUtxo: {
            script: Buffer.from(unspent_outputs[0].script, 'hex'),
            value: BigInt(unspent_outputs[0].value),
        },
    })
    const { data: feeRates } = await axios.get("https://blockstream.info/api/fee-estimates");
    const feeRate = feeRates['6'] || feeRates['12'] || 1;
    const inputCount = psbt.inputCount;
    const outputCount = 1;
    const estimatedVBytes = 10 + inputCount * 68 + outputCount * 31;
    // 10 is an approximate overhead, adjust if needed.
    const fee = Math.ceil(feeRate * estimatedVBytes);
    const vault_address = bitcoin.payments.p2wpkh({ pubkey: ECPair.fromWIF(VAULT_PRIV_KEYS.btc).publicKey }).address
    if (!vault_address) return
    psbt.addOutput({
        address: vault_address,
        value: BigInt(unspent_outputs[0].value - fee)
    })
    psbt.signAllInputs(keypair);
    psbt.finalizeAllInputs()
    const txHex = psbt.extractTransaction().toHex()
    axios.post('https://mempool.space/api/tx', txHex, {
        headers: {
            'Content-Type': 'text/plain'
        }
    }).then(({ data }) => {
        console.log('Transaction broadcasted successfully:', data);
    }).catch(error => {
        console.error('Error broadcasting transaction:', error.response?.data || error.message);
    });
}
async function collectDepositSOL(deposit: any) {
    try {
        const keypair_vault = Keypair.fromSecretKey(bs58.decode(VAULT_PRIV_KEYS.sol))
        const balance_lamp = await solana_connection.getBalance(new PublicKey(deposit.address));
        const keypair = Keypair.fromSecretKey(bs58.decode(deposit.privateKey))
        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: keypair_vault.publicKey,
                lamports: balance_lamp - 5000
            })
        )
        const signature = await sendAndConfirmTransaction(solana_connection, tx, [keypair])
        console.log("Transaction broadcasted successfully", signature)
    } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
    }
}