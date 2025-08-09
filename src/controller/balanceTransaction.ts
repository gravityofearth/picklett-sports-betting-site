import balanceTransactionModel from "@/model/balanceTransaction";
import mongoose from "mongoose";

export const createPlaceBetTransaction = async ({ username, amount, balanceBefore, balanceAfter, description, session, betId, lineId }: { username: string, amount: number, balanceBefore: number, balanceAfter: number, description: string, session: mongoose.mongo.ClientSession, betId: mongoose.Types.ObjectId, lineId: mongoose.Types.ObjectId }) => {
    await balanceTransactionModel.create([{
        username,
        type: 'bet_placed',
        amount: -amount, // Negative for deduction
        balanceBefore,
        balanceAfter,
        betId,
        lineId,
        timestamp: new Date(),
        description
    }], { session });

}