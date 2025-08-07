
import betModel from "@/model/bet";
import lineModel from "@/model/line";
import userModel from "@/model/user";
import { convertAmerican2DecimalOdds } from "@/utils";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";

export async function createLine({ question, yes, no, endsAt, result }: { question: string, yes: number, no: number, endsAt: number, result: string }) {
    await connectMongoDB()
    try {
        const newLine = new lineModel({ question, yes, no, endsAt, result });

        const savedLine = await newLine.save();
        return savedLine;
    } catch (error) {
        console.error('Error creating line:', error);
        throw error
    }
}
export async function updateLine({ question, yes, no, endsAt, result, _id }: { question: string, yes: number, no: number, endsAt: number, result: string, _id: string }) {
    await connectMongoDB()
    try {
        const updatedLine = await lineModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(_id) },
            {
                question, yes, no, endsAt, result
            },
            { new: true }
        )

        return updatedLine;
    } catch (error) {
        console.error('Error creating line:', error);
        throw error
    }
}

export async function findLine() {
    await connectMongoDB()
    try {
        // Include password for login verification
        const line = await lineModel.findOne({ result: "pending" })
        return line;
    } catch (error) {
        console.error('Error finding line:', error);
        throw error
    }
}
export async function findLineById(id: string) {
    await connectMongoDB()
    try {
        // Include password for login verification
        const line = await lineModel.findById(new mongoose.Types.ObjectId(id))
        return line;
    } catch (error) {
        console.error('Error finding line:', error);
        throw error
    }
}

export async function createBet({ username, lineId, side, amount }: { username: string, lineId: string, side: string, amount: number }) {
    await connectMongoDB()
    try {
        const newBet = new betModel({ username, lineId: new mongoose.Types.ObjectId(lineId), side, amount, status: "pending" });

        const savedBet = await newBet.save();
        const completeBet = await betModel.aggregate([
            { $match: { _id: savedBet._id } },
            {
                $lookup: {
                    from: "lines",
                    localField: "lineId",
                    foreignField: "_id",
                    as: "lineData"
                }
            },
            {
                $unwind: {
                    path: "$lineData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    username: 1,
                    amount: 1,
                    createdAt: 1,
                    lineId: 1,
                    side: 1,
                    status: 1,
                    question: "$lineData.question",
                    result: "$lineData.result",
                    lineData: 1
                }
            }
        ]);

        return completeBet[0];
    } catch (error) {
        console.error('Error creating line:', error);
        throw error
    }
}

export async function findBet(username: string) {
    await connectMongoDB()
    try {
        // Include password for login verification
        const matchStage = username === "admin" ? {} : { username };
        const bet = await betModel.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "lines", // collection name in MongoDB
                    localField: "lineId",
                    foreignField: "_id", // or whatever the ID field is in lines collection
                    as: "lineData"
                }
            },
            {
                $unwind: {
                    path: "$lineData",
                    preserveNullAndEmptyArrays: true // keeps bets even if no matching line found
                }
            },
            {
                $project: {
                    // Include all bet fields
                    username: 1,
                    amount: 1,
                    createdAt: 1,
                    lineId: 1,
                    side: 1,
                    status: 1,
                    question: "$lineData.question",
                    result: "$lineData.result",
                    lineData: 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return bet;
    } catch (error) {
        console.error('Error finding bet:', error);
        throw error
    }
}

export async function resolveBet(lineId: string, winningSide: "yes" | "no") {
    await connectMongoDB()
    try {
        const result = await lineModel.findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(lineId),
            result: "pending"
        }, { result: winningSide }, { new: true })
        if (!result) {
            throw new Error("Not found pending line")
        }
        const odd = Number(result[winningSide])

        await betModel.updateMany({
            lineId: new mongoose.Types.ObjectId(lineId),
            status: "pending",
            side: winningSide
        }, { status: "win" })
        await betModel.updateMany({
            lineId: new mongoose.Types.ObjectId(lineId),
            status: "pending",
            side: winningSide === "yes" ? "no" : "yes"
        }, { status: "lose" })
        // const winners = await betModel.find({ lineId: new mongoose.Types.ObjectId(lineId), status: "win" })
        // const groupedWinners = await betModel.aggregate([
        //     {
        //         $match: {
        //             lineId: new mongoose.Types.ObjectId(lineId),
        //             status: "win"
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: "$username",
        //             bets: { $push: "$$ROOT" },
        //             totalAmount: { $sum: "$amount" },
        //             betCount: { $sum: 1 }
        //         }
        //     }
        // ]);
        // console.log(groupedWinners)

        await betModel.aggregate([
            // Match winning bets for the line
            {
                $match: {
                    lineId: new mongoose.Types.ObjectId(lineId),
                    status: "win"
                }
            },
            // Group by username and sum amounts
            {
                $group: {
                    _id: "$username",
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $addFields: {
                    totalWinnings: { $multiply: ["$totalAmount", odd] },
                    username: "$_id"
                }
            },
            // Merge into users collection to update balances
            {
                $merge: {
                    into: "users", // Your users collection name
                    on: "username",
                    whenMatched: [
                        {
                            $set: {
                                balance: { $add: ["$balance", "$$new.totalWinnings"] }
                            }
                        }
                    ],
                    whenNotMatched: "discard" // Don't create new users
                }
            }
        ])
    } catch (error) {
        console.error('Error resolving bet:', error);
        throw error
    }
}
