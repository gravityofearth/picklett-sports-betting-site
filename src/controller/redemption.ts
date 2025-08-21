
import redemptionModel from "@/model/redemption";
import userModel from "@/model/user";
import { generateReferralCode } from "@/utils";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
import { increaseBalance } from "./user";
import balanceTransactionModel from "@/model/balanceTransaction";
export async function createRedemption(amount: number) {
    await connectMongoDB()
    try {
        const code = generateReferralCode()
        const newRedemption = new redemptionModel({ amount, code, status: "pending" });
        const savedRedemption = await newRedemption.save();
        return savedRedemption;
    } catch (error) {
        console.error('Error creating redemption code:', error);
        throw error
    }
}
export async function findRedemptions() {
    await connectMongoDB()
    try {
        const redemptions = await redemptionModel.find().sort({ createdAt: -1 })
        return redemptions;
    } catch (error) {
        console.error('Error finding redemption code:', error);
        throw error
    }
}
export async function findRedemptionByCode(code: string) {
    await connectMongoDB()
    try {
        const redemption = await redemptionModel.findOne({ code })
        return redemption;
    } catch (error) {
        console.error('Error finding redemption code:', error);
        throw error
    }
}
export async function redeemCode({ code, username }: { code: string, username: string }) {

    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const redemption = await redemptionModel.findOneAndUpdate(
            { code },
            {
                $set: {
                    username,
                    status: "redeemed"
                }
            },
            {
                new: true, // Return updated document
                session,
            }
        )
        const amount = redemption.amount
        const user = await userModel.findOne({ username }).session(session);
        const updatedUser = await increaseBalance(username, amount, session);
        const newBalance = new balanceTransactionModel({
            username,
            type: "redeem",
            amount: amount,
            balanceBefore: user.balance,
            balanceAfter: updatedUser.balance,
            redemptionId: redemption.id,
            timestamp: new Date(),
            description: `Redeem: $${amount} via ${code}`
        })

        const savedBalance = await newBalance.save({ session });
        await session.commitTransaction();
        return { redemption, updatedUser }

    } catch (error) {
        console.error('Error processing redeem code:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}