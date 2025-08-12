
import betModel from "@/model/bet";
import lineModel from "@/model/line";
import userModel from "@/model/user";
import { convertAmerican2DecimalOdds } from "@/utils";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
import { increaseBalance } from "./user";
import { createPlaceBetTransaction } from "./balanceTransaction";
import balanceTransactionModel from "@/model/balanceTransaction";
import axios from "axios";
const discord_webhook_url = process.env.DISCORD_WEBHOOK
export async function createLine({ question, yes, no, endsAt, result }: { question: string, yes: number, no: number, endsAt: number, result: string }) {
    await connectMongoDB()
    try {
        const newLine = new lineModel({ question, yes, no, endsAt, result });
        const savedLine = await newLine.save();
        sendDiscordWebhook(newLine)
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
        sendDiscordWebhook(updatedLine, true)
        return updatedLine;
    } catch (error) {
        console.error('Error creating line:', error);
        throw error
    }
}
function sendDiscordWebhook(line: any, isUpdated?: boolean) {
    if (discord_webhook_url) {
        const webhook_payload = {
            "username": "Picklett Live Alert",
            "avatar_url": "https://cdn.discordapp.com/avatars/592720707981410304/4887cbde76665c21df2e9bed925bbeb9.webp?size=128",
            "content": "",
            "embeds": [
                {
                    "author": {
                        "name": "picklett.com",
                        "url": "https://www.picklett.com",
                        "icon_url": "https://www.picklett.com/favicon.ico"
                    },
                    "title": `Click here to predict`,
                    "url": "https://www.picklett.com/home",
                    "description": `# ${line.question}`,
                    "color": 15258703,
                    "fields": [
                        {
                            "name": "Yes Odds",
                            "value": `${line.yes}`,
                            "inline": true
                        },
                        {
                            "name": "No Odds",
                            "value": `${line.no}`,
                            "inline": true
                        },
                        {
                            "name": "Game start timing",
                            "value": `${new Date(line.endsAt).toUTCString()}`,
                            "inline": false
                        }
                    ],
                    "footer": {
                        "text": "Powered by Picklett.com",
                        "icon_url": "https://www.picklett.com/favicon.ico"
                    }
                }
            ]
        }
        axios.post(discord_webhook_url, webhook_payload)
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

export async function placeBet({ username, lineId, side, amount }: { username: string, lineId: string, side: string, amount: number }) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await userModel.findOne({ username }).session(session);
        if (!user || user.balance < amount) {
            throw new Error('Insufficient balance');
        }

        const newBet = new betModel({ username, lineId: new mongoose.Types.ObjectId(lineId), side, amount, status: "pending" });

        const savedBet = await newBet.save({ session });
        const updatedUser = await increaseBalance(username, -amount, session);
        await createPlaceBetTransaction({
            username, amount,
            balanceBefore: user.balance,
            balanceAfter: updatedUser.balance,
            description: `Bet placed: ${side} for $${amount}`,
            betId: savedBet._id,
            lineId: new mongoose.Types.ObjectId(lineId),
            session
        })
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
        ]).session(session);
        await session.commitTransaction();

        return {
            bet: completeBet[0],
            user: updatedUser
        }
    } catch (error) {
        console.error('Error creating line:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const result = await lineModel.findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(lineId),
            result: "pending"
        }, { result: winningSide }, { new: true }).session(session)
        if (!result) {
            throw new Error("Not found pending line")
        }
        const odd = Number(result[winningSide])

        await betModel.updateMany({
            lineId: new mongoose.Types.ObjectId(lineId),
            status: "pending",
            side: winningSide
        }, { status: "win" }).session(session)
        await betModel.updateMany({
            lineId: new mongoose.Types.ObjectId(lineId),
            status: "pending",
            side: winningSide === "yes" ? "no" : "yes"
        }, { status: "lose" }).session(session)
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

        const winningBetsData = await betModel.aggregate([
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
            // Lookup current balance before update
            {
                $lookup: {
                    from: "users",
                    localField: "username",
                    foreignField: "username",
                    as: "currentUser"
                }
            },
            {
                $addFields: {
                    balanceBefore: { $arrayElemAt: ["$currentUser.balance", 0] },
                    balanceAfter: {
                        $add: [
                            { $arrayElemAt: ["$currentUser.balance", 0] },
                            "$totalWinnings"
                        ]
                    }
                }
            }
            // // Create transaction record
            // {
            //     $addFields: {
            //         transaction: {
            //             username: "$username",
            //             type: "bet_win",
            //             amount: "$totalWinnings",
            //             balanceBefore: { $arrayElemAt: ["$currentUser.balance", 0] },
            //             balanceAfter: {
            //                 $add: [
            //                     { $arrayElemAt: ["$currentUser.balance", 0] },
            //                     "$totalWinnings"
            //                 ]
            //             },
            //             timestamp: new Date(),
            //             lineId: lineId
            //         }
            //     }
            // },
            // // Save transaction log
            // {
            //     $merge: {
            //         into: "balance_transactions",
            //         whenMatched: "replace",
            //         whenNotMatched: "insert"
            //     }
            // },
            // // Merge into users collection to update balances
            // {
            //     $merge: {
            //         into: "users", // Your users collection name
            //         on: "username",
            //         whenMatched: [
            //             {
            //                 $set: {
            //                     balance: { $add: ["$balance", "$$new.totalWinnings"] }
            //                 }
            //             }
            //         ],
            //         whenNotMatched: "discard" // Don't create new users
            //     }
            // }
        ]).session(session)
        // Create transaction records
        const transactions = winningBetsData.map(bet => ({
            username: bet.username,
            type: "bet_win",
            amount: bet.totalWinnings,
            balanceBefore: bet.balanceBefore,
            balanceAfter: bet.balanceAfter,
            timestamp: new Date(),
            lineId: new mongoose.Types.ObjectId(lineId),
            description: `Bet win: on ${winningSide}`
        }));
        // Insert transaction logs
        if (transactions.length > 0) {
            await balanceTransactionModel.insertMany(transactions, { session });
        }
        // Update user balances
        const balanceUpdates = winningBetsData.map(bet => ({
            updateOne: {
                filter: { username: bet.username },
                update: {
                    $inc: { balance: bet.totalWinnings },
                    $set: { lastUpdated: new Date() }
                }
            }
        }));

        const winstreaks = await betModel.aggregate([
            // Stage 1: Sort by username and time to ensure proper ordering
            {
                $sort: {
                    username: 1,
                    createdAt: 1
                }
            },

            // Stage 2: Group by username to collect all bets per user
            {
                $group: {
                    _id: "$username",
                    bets: {
                        $push: {
                            status: "$status",
                            time: "$createdAt"
                        }
                    }
                }
            },

            // Stage 3: Find the latest lose time and count wins after that time
            {
                $addFields: {
                    // Find all lose times
                    loseTimes: {
                        $filter: {
                            input: "$bets",
                            cond: { $eq: ["$$this.status", "lose"] }
                        }
                    }
                }
            },

            // Stage 4: Calculate the latest lose time
            {
                $addFields: {
                    latestLoseTime: {
                        $cond: {
                            if: { $gt: [{ $size: "$loseTimes" }, 0] },
                            then: {
                                $max: "$loseTimes.time"
                            },
                            else: null
                        }
                    }
                }
            },

            // Stage 5: Count wins after the latest lose time
            {
                $addFields: {
                    winsAfterLatestLose: {
                        $cond: {
                            if: { $ne: ["$latestLoseTime", null] },
                            then: {
                                $size: {
                                    $filter: {
                                        input: "$bets",
                                        cond: {
                                            $and: [
                                                { $eq: ["$$this.status", "win"] },
                                                { $gt: ["$$this.time", "$latestLoseTime"] }
                                            ]
                                        }
                                    }
                                }
                            },
                            else: {
                                // If no lose found, count all wins
                                $size: {
                                    $filter: {
                                        input: "$bets",
                                        cond: { $eq: ["$$this.status", "win"] }
                                    }
                                }
                            }
                        }
                    }
                }
            },

            // Stage 6: Project final result
            {
                $project: {
                    username: "$_id",
                    winsAfterLatestLose: 1,
                    latestLoseTime: 1, // Optional: include for debugging
                    _id: 0
                }
            },

            // Stage 7: Sort by username for consistent output
            {
                $sort: {
                    username: 1
                }
            }
        ]).session(session)
        const winstreakUpdates = winstreaks.map(winstreak => ({
            updateOne: {
                filter: { username: winstreak.username },
                update: {
                    $set: { winstreak: winstreak.winsAfterLatestLose }
                }
            }
        }));
        const userUpdates = [...balanceUpdates, ...winstreakUpdates]
        if (userUpdates.length > 0) {
            await userModel.bulkWrite(userUpdates, { session });
        }
        await session.commitTransaction();
    } catch (error) {
        console.error('Error resolving bet:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}
