import affiliateRewardModel from "@/model/affiliateReward";
import balanceTransactionModel from "@/model/balanceTransaction";
import userModel from "@/model/user";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
export async function getAffiliates({ role, referrer }: { role: string, referrer: string }) {
    await connectMongoDB()
    try {
        const affRewards = await affiliateRewardModel.find(role === "admin" ? {} : { referrer }).sort({ startsAt: -1 })
        return affRewards
    } catch (error) {
        console.error('Error fetching affiliate rewards:', error);
        throw error
    }
}
export const distributeAffiliateRewards = async ({ startsAt, endsAt }: { startsAt: number; endsAt: number; }) => {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // const startsAt = 1755302400000
        // const endsAt = 1755734400000
        const startDate = new Date(startsAt);
        const endDate = new Date(endsAt);

        const cycleData = await affiliateRewardModel.find({ startsAt })
        if (cycleData.length > 0) {
            return []
        }

        const affiliateRewards = await userModel.aggregate([
            // Stage 1: Match users who have a referrer (refby is not empty)
            {
                $match: {
                    refby: { $nin: [null, ""], $exists: true }
                }
            },

            // Stage 3: Lookup lines that match criteria (not pending, within date range)
            {
                $lookup: {
                    from: "lines",
                    pipeline: [
                        {
                            $match: {
                                result: { $ne: "pending" },
                                updatedAt: {
                                    $gte: startDate,
                                    $lte: endDate
                                }
                            }
                        },
                        {
                            $project: { _id: 1 }
                        }
                    ],
                    as: "validLines"
                }
            },

            // Stage 5: Lookup balance transactions for each referee
            {
                $lookup: {
                    from: "balancetransactions",
                    let: {
                        referee: "$username",
                        lineIds: { $map: { input: "$validLines", as: "line", in: "$$line._id" } }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$username", "$$referee"] },
                                        { $in: ["$lineId", "$$lineIds"] },
                                        { $in: ["$type", ["bet_placed", "bet_win"]] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "transactions"
                }
            },

            // Stage 6: Calculate total amount per referee
            {
                $addFields: {
                    refereeTotal: {
                        $sum: "$transactions.amount"
                    },
                    refereeBetPlaceTotal: {
                        $sum: {
                            $map: {
                                input: "$transactions",
                                as: "tx",
                                in: {
                                    $cond: {
                                        if: { $eq: ["$$tx.type", "bet_placed"] },
                                        then: "$$tx.amount",
                                        else: 0
                                    }
                                }
                            }
                        }
                    }
                }
            },

            // Stage 7: Group back by referrer and sum all referee totals
            {
                $group: {
                    _id: "$refby",
                    referees: { $push: "$username" },
                    totalAmount: { $sum: "$refereeTotal" },
                    totalBetPlaceAmount: { $sum: "$refereeBetPlaceTotal" },
                    refereeDetails: {
                        $push: {
                            referee: "$username",
                            amount: "$refereeTotal"
                        }
                    },
                }
            },
            {
                $match: {
                    totalAmount: { $lt: 0 },
                    totalBetPlaceAmount: { $lt: -100 }
                }
            },
            {
                $addFields: {
                    startsAt: startsAt,
                    endsAt: endsAt,
                    timestamp: Date.now(),
                    revenue: { $multiply: ["$totalAmount", -1] },
                    totalBets: { $multiply: ["$totalBetPlaceAmount", -1] },
                    earning: { $multiply: ["$totalAmount", -0.05] },
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "_id",
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
                            "$earning"
                        ]
                    }
                }
            },
            // Stage 8: Final projection to match desired output format
            {
                $project: {
                    referrer: "$_id",
                    // referees: 1,
                    revenue: 1,
                    totalBets: 1,
                    detail: "$refereeDetails",
                    startsAt: 1,
                    endsAt: 1,
                    timestamp: 1,
                    earning: 1,
                    balanceBefore: 1,
                    balanceAfter: 1,
                    _id: 0
                }
            },
        ]).session(session)
        if (affiliateRewards.length > 0) {
            await affiliateRewardModel.insertMany(affiliateRewards, { session })
            const rewardUpdates = affiliateRewards.map(reward => ({
                updateOne: {
                    filter: { username: reward.referrer },
                    update: {
                        $inc: { balance: reward.earning },
                    }
                }
            }));
            const transactions = affiliateRewards.map(reward => ({
                username: reward.referrer,
                type: "affiliate_reward",
                amount: reward.earning,
                balanceBefore: reward.balanceBefore,
                balanceAfter: reward.balanceAfter,
                timestamp: new Date(),
                description: `Affiliate Reward for cycle: ${new Date(startsAt).toLocaleDateString("sv-SE")} ~ ${new Date(endsAt).toLocaleDateString("sv-SE")}`
            }));
            await userModel.bulkWrite(rewardUpdates, { session });
            await balanceTransactionModel.insertMany(transactions, { session });
        }
        await session.commitTransaction();
        return affiliateRewards
    } catch (error) {
        console.error('Error getting affiliate rewards in affiliate system:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}
export const getDeservedReferrers = async ({ startsAt, endsAt }: { startsAt: number; endsAt: number; }) => {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const startDate = new Date(startsAt);
        const endDate = new Date(endsAt);
        const deservedReferrers = await userModel.aggregate([
            // Stage 1: Match users who have a referrer (refby is not empty)
            {
                $match: {
                    refby: { $nin: [null, ""], $exists: true }
                }
            },

            // Stage 2: Group by referrer (refby) first to collect all referees
            {
                $group: {
                    _id: "$refby", // Group by referrer username
                    referrerUsername: { $first: "$refby" },
                    referees: { $push: "$username" } // Collect all referee usernames
                }
            },

            // Stage 3: Lookup bets for all referees in each group
            {
                $lookup: {
                    from: "bets",
                    let: {
                        refereeUsernames: "$referees",
                        startTime: startDate,
                        endTime: endDate
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$username", "$$refereeUsernames"] },
                                        { $gte: ["$createdAt", "$$startTime"] },
                                        { $lte: ["$createdAt", "$$endTime"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "refereeBets"
                }
            },

            // Stage 4: Calculate totals
            {
                $addFields: {
                    totalRefereesBetAmount: { $sum: "$refereeBets.amount" },
                    refereeCount: { $size: "$referees" },
                    // Optional: Calculate per-referee breakdown
                    refereeBreakdown: {
                        $map: {
                            input: "$referees",
                            as: "referee",
                            in: {
                                username: "$$referee",
                                betAmount: {
                                    $sum: {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$refereeBets",
                                                    cond: { $eq: ["$$this.username", "$$referee"] }
                                                }
                                            },
                                            in: "$$this.amount"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // Filter referrers with total bet amount > 100
            {
                $match: {
                    totalRefereesBetAmount: { $gt: 100 }
                }
            },
            // Stage 5: Sort by total bet amount (descending)
            {
                $sort: {
                    totalRefereesBetAmount: -1
                }
            },

            // Stage 6: Project final result format
            {
                $project: {
                    _id: 0,
                    referrerUsername: 1,
                    totalRefereesBetAmount: 1,
                    refereeCount: 1,
                    refereeBreakdown: 1
                }
            }
        ]).session(session)
        await session.commitTransaction();
        return deservedReferrers
    } catch (error) {
        console.error('Error getting deserved users in affiliate system:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}