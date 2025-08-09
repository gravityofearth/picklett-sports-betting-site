
import balanceTransactionModel from "@/model/balanceTransaction";
import depositModel from "@/model/deposit";
import connectMongoDB from "@/utils/mongodb";
import axios from "axios";
import mongoose from "mongoose";
import { increaseBalance } from "./user";
import userModel from "@/model/user";
// const dedicatedWallet = "0x1F0E8E61E2C2BeB9b9cdea7Dc2BD8C761124533e"
const dedicatedWallet = "0x1a556f70bF5957A44F47DeA849D1fB1781FB26a7" // Nathan
export async function createDeposit({ username, sender, depositAmount }: { username: string, sender: string, depositAmount: number }) {
    const { data: { price: priceETH } } = await axios.get("https://data-api.binance.vision/api/v3/ticker/price?symbol=ETHUSDT")
    await connectMongoDB()
    try {
        const targetETH = Math.ceil((depositAmount + 1) / priceETH * 10 ** 8) / 10 ** 8
        const newDeposit = new depositModel({
            username, sender, depositAmount,
            targetUSDT: Math.ceil(depositAmount),
            targetETH,
            coinType: "undefined",
            dedicatedWallet,
            tx: "undefined",
            result: "initiated",
            reason: ""
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
export async function updateDeposit(id: string, coinType: string, tx: string, result: string, reason?: string, session?: mongoose.mongo.ClientSession) {
    await connectMongoDB()
    try {
        const deposit = await depositModel.findByIdAndUpdate(new mongoose.Types.ObjectId(id), { $set: { coinType, tx, result, reason } }, { new: true }).session(session || null)
        return deposit
    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
export async function verifyDeposit(deposit: any, coinType: string, tx: string) {
    await connectMongoDB()
    try {
        const { dedicatedWallet, sender, targetETH, targetUSDT, depositAmount, createdAt } = deposit
        const { data: { result: { status } } } = await axios.get(`https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${tx}&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
        if (status === 0) {
            await depositFailed(deposit.id, coinType, tx, "Submitted failed transaction")
            return
        }
        if (coinType === "ETH") {
            const { data: { result: tx_result } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getTransactionByHash&txhash=${tx}&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
            if (tx_result.to.toLowerCase() === "0xdac17f958d2ee523a2206206994597c13d831ec7") {
                await depositFailed(deposit.id, coinType, tx, "Your chose ETH deposit, but sent USDT")
                return
            }
            const value_match = BigInt(targetETH * 10 ** 18) <= BigInt(tx_result.value)
            if (!value_match) {
                await depositFailed(deposit.id, coinType, tx, "Amount sent is not the same as deposit detail")
                return
            }
            const from_match = tx_result.from.toLowerCase() === sender.toLowerCase()
            if (!from_match) {
                await depositFailed(deposit.id, coinType, tx, "Transaction sent from different user wallet")
                return
            }
            const to_match = tx_result.to.toLowerCase() === dedicatedWallet.toLowerCase()
            if (!to_match) {
                await depositFailed(deposit.id, coinType, tx, "Sent to different destination address")
                return
            }
            const { data: { result: block_result } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=${tx_result.blockNumber}&boolean=false&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
            const ts_match = new Date(createdAt).getTime() / 1000 < Number(BigInt(block_result.timestamp))
            // && Number(BigInt(block_result.timestamp)) < new Date(createdAt).getTime() / 1000 + 10 * 60

            if (!ts_match) {
                await depositFailed(deposit.id, coinType, tx, "This transaction is made before deposit initiating")
                return
            }
            await depositSuccess(deposit.id, coinType, tx)
        } else {
            const { data: { result: { logs, blockNumber } } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getTransactionReceipt&txhash=${tx}&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
            const usdt_logs = logs.filter((v: any) =>
                v?.address === "0xdac17f958d2ee523a2206206994597c13d831ec7"
                && v?.topics?.length === 3
                && v?.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
            )
            if (usdt_logs.length === 0) {
                await depositFailed(deposit.id, coinType, tx, "This transaction includes no USDT transfer")
                return
            }
            const sender_logs = usdt_logs.filter((v: any) => v.topics[1].replace("0x000000000000000000000000", "0x").toLowerCase() === sender.toLowerCase())
            if (sender_logs.length === 0) {
                await depositFailed(deposit.id, coinType, tx, "Not found matching sender address in this transaction")
                return
            }
            const dest_logs = sender_logs.filter((v: any) => v.topics[2].replace("0x000000000000000000000000", "0x").toLowerCase() === dedicatedWallet.toLowerCase())
            if (dest_logs.length === 0) {
                await depositFailed(deposit.id, coinType, tx, "Sent to different destination address")
                return
            }
            const transfer_amount = Number(BigInt(dest_logs[0].data) / BigInt("1000000"))
            if (transfer_amount < targetUSDT) {
                await depositFailed(deposit.id, coinType, tx, "Amount sent is not the same as deposit detail")
                return
            }
            const { data: { result: block_result } } = await axios.get(`https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=false&apikey=C6UI3VE5U6H9VKW71NHVSZRHIBZ446KGVR`)
            const ts_match = new Date(createdAt).getTime() / 1000 < Number(BigInt(block_result.timestamp))

            if (!ts_match) {
                await depositFailed(deposit.id, coinType, tx, "This transaction is made before deposit initiating")
                return
            }
            await depositSuccess(deposit.id, coinType, tx)
        }

    } catch (error) {
        console.error('Error fetching deposit:', error);
        throw error
    }
}
async function depositSuccess(id: string, coinType: string, tx: string) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { username, depositAmount } = await updateDeposit(id, coinType, tx, "success", undefined, session)
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
            description: `Deposit: $${depositAmount} via ${coinType}`
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
async function depositFailed(id: string, coinType: string, tx: string, reason: string) {
    await updateDeposit(id, coinType, tx, "failed", reason)
}
export async function findDeposit(username: string) {
    await connectMongoDB()
    const matchStage = username === "admin" ? {} : { username }
    const deposit = await depositModel.find(matchStage).sort({ createdAt: -1 })
    return deposit
}