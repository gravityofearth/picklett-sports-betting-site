
import balanceTransactionModel from "@/model/balanceTransaction";
import depositModel from "@/model/deposit";
import connectMongoDB from "@/utils/mongodb";
import axios from "axios";
import mongoose from "mongoose";
import { increaseBalance } from "./user";
import userModel from "@/model/user";
// const dedicatedWallet = "0x1F0E8E61E2C2BeB9b9cdea7Dc2BD8C761124533e"
const dedicatedWallet = "0x1a556f70bF5957A44F47DeA849D1fB1781FB26a7" // Nathan
export async function createDeposit({ username, sender }: { username: string, sender: string }) {
    await connectMongoDB()
    try {
        const { data: { result: { timestamp } } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=latest&boolean=false&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)

        const newDeposit = new depositModel({
            username, sender,
            dedicatedWallet,
            depositAmount: 0,
            tx: "undefined",
            result: "initiated",
            reason: "",
            blockTimestampAtCreated: timestamp,
        });

        const savedDeposit = await newDeposit.save();
        return savedDeposit;
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
export async function getDepositByTx(tx: string) {
    await connectMongoDB()
    try {
        const matching_tx = await depositModel.findOne({ tx })
        return matching_tx
    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
export async function updateDeposit({ id, tx, result, reason, session, depositAmount }: { id: string, tx: string, result: string, reason?: string, session?: mongoose.mongo.ClientSession, depositAmount?: number }) {
    await connectMongoDB()
    try {
        const deposit = await depositModel.findByIdAndUpdate(new mongoose.Types.ObjectId(id), { $set: { tx, result, reason, depositAmount } }, { new: true }).session(session || null)
        return deposit
    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
export async function verifyDeposit(deposit: any, tx: string) {
    await connectMongoDB()
    try {
        const { dedicatedWallet, sender, blockTimestampAtCreated } = deposit
        const { data: { result: tx_result } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getTransactionByHash&txhash=${tx}&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
        if (!tx_result) {
            await depositFailed(deposit.id, tx, "Not found such transaction")
            return
        }

        const { data: { result: { status } } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=transaction&action=gettxreceiptstatus&txhash=${tx}&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
        if (status !== "1") {
            await depositFailed(deposit.id, tx, "Submitted failed transaction")
            return
        }

        const { data: { result: block_result } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=${tx_result.blockNumber}&boolean=false&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
        const ts_match = Number(BigInt(blockTimestampAtCreated)) < Number(BigInt(block_result.timestamp))
        if (!ts_match) {
            await depositFailed(deposit.id, tx, "This transaction is made before deposit initiating")
            return
        }

        const isETH = tx_result.to.toLowerCase() !== "0xdac17f958d2ee523a2206206994597c13d831ec7"
        let depositAmount = 0
        if (isETH) {
            const { data: { price: priceETH } }: { data: { price: number } } = await axios.get("https://data-api.binance.vision/api/v3/ticker/price?symbol=ETHUSDT")
            const eth_amount = Number(BigInt(tx_result.value)) / 10 ** 18
            depositAmount = Math.floor(eth_amount * priceETH * 100) / 100
            const from_match = tx_result.from.toLowerCase() === sender.toLowerCase()
            if (!from_match) {
                await depositFailed(deposit.id, tx, "Transaction sent from different user wallet")
                return
            }
            const to_match = tx_result.to.toLowerCase() === dedicatedWallet.toLowerCase()
            if (!to_match) {
                await depositFailed(deposit.id, tx, "Sent to different destination address")
                return
            }
        } else {
            const { data: { result: { logs } } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getTransactionReceipt&txhash=${tx}&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
            const usdt_logs = logs.filter((v: any) =>
                v?.address === "0xdac17f958d2ee523a2206206994597c13d831ec7"
                && v?.topics?.length === 3
                && v?.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
            )
            if (usdt_logs.length === 0) {
                await depositFailed(deposit.id, tx, "This transaction includes no USDT transfer")
                return
            }
            const sender_logs = usdt_logs.filter((v: any) => v.topics[1].replace("0x000000000000000000000000", "0x").toLowerCase() === sender.toLowerCase())
            if (sender_logs.length === 0) {
                await depositFailed(deposit.id, tx, "Not found matching sender address in this transaction")
                return
            }
            const dest_logs = sender_logs.filter((v: any) => v.topics[2].replace("0x000000000000000000000000", "0x").toLowerCase() === dedicatedWallet.toLowerCase())
            if (dest_logs.length === 0) {
                await depositFailed(deposit.id, tx, "Sent to different destination address")
                return
            }
            const usdt_amount = Number(BigInt(dest_logs[0].data)) / 1000000
            depositAmount = Math.floor(usdt_amount * 100) / 100
        }

        const { data: { result: { number: latestBlockNumber } } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=latest&boolean=false&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
        const confirmations = Number(BigInt(latestBlockNumber) - BigInt(tx_result.blockNumber))
        if (confirmations <= 6) {
            await updateDeposit({
                id: deposit.id,
                tx,
                result: "verifying",
                reason: `${confirmations} / 6 confirmations`,
                depositAmount
            })
            setTimeout(() => verifyDeposit(deposit, tx), 12000);
            return
        }

        await depositSuccess(deposit.id, tx, depositAmount)

    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
async function depositSuccess(id: string, tx: string, depositAmount: number) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { username } = await updateDeposit({
            id, tx, result: "success", depositAmount, reason: "", session
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
            description: `Deposit: $${depositAmount} via ${tx}`
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
async function depositFailed(id: string, tx: string, reason: string) {
    await updateDeposit({ id, tx, result: "failed", reason })
}
export async function findDeposit_no_initiated(username: string) {
    await connectMongoDB()
    const matchStage = username === "admin" ? { result: { $ne: "initiated" } } : { username, result: { $ne: "initiated" } }
    const deposit = await depositModel.find(matchStage).sort({ createdAt: -1 })
    return deposit
}