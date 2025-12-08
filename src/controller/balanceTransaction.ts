import balanceTransactionModel from "@/model/balanceTransaction";
import mongoose from "mongoose";

export const createPlaceBetTransaction = async ({ username, insertedBets, origin_balance, session }: { username: string, insertedBets: any[], origin_balance: number, session: mongoose.mongo.ClientSession }) => {
    const balanceTxs: any[] = []
    let balanceBefore = origin_balance
    let balanceAfter = balanceBefore
    for (let { _id, lineId, amount } of insertedBets) {
        balanceAfter = balanceBefore - amount
        balanceTxs.push({
            username,
            type: 'bet_placed',
            amount: -amount,
            balanceBefore,
            balanceAfter,
            betId: new mongoose.Types.ObjectId(_id as string),
            lineId: new mongoose.Types.ObjectId(lineId as string),
            timestamp: new Date(),
            description: `Bet placed $${amount}`
        })
        balanceBefore = balanceAfter
    }
    await balanceTransactionModel.insertMany(balanceTxs, { session, lean: true });
}