

import userModel from "@/model/user";
import withdrawModel from "@/model/withdraw";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
import { increaseBalance } from "./user";
import balanceTransactionModel from "@/model/balanceTransaction";
export async function createWithdraw({ username, wallet, amount }: { username: string, wallet: string, amount: number }) {
    await connectMongoDB()
    try {
        const newDeposit = new withdrawModel({
            username, wallet, amount,
            tx: "undefined",
            result: "requested",
            reason: ""
        });

        const savedDeposit = await newDeposit.save();
        return savedDeposit;
    } catch (error) {
        console.error('Error creating deposit:', error);
        throw error
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
                    createdAT: 1,
                    reason: 1,
                    amount: 1,
                    result: 1,
                    tx: 1,
                    wallet: 1,
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
export async function approveWithdraw({ id, tx }: { id: string, tx: string }) {
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
            description: `Withdrawl: $${withdraw.amount} through ${tx}`
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