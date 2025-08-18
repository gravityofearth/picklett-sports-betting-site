import affiliateRewardModel from "@/model/affiliateReward";
import userModel from "@/model/user";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
export const distributeAffiliateRewards = async ({ startsAt, endsAt, timestamp }: { startsAt: number; endsAt: number; timestamp: number; }) => {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
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

            // Stage 2: Group referees by referrer
            {
                $group: {
                    _id: "$refby",
                    referees: { $push: "$username" }
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

            // Stage 4: Unwind referees to process each referee individually
            {
                $unwind: "$referees"
            },

            // Stage 5: Lookup balance transactions for each referee
            {
                $lookup: {
                    from: "balancetransactions",
                    let: {
                        referee: "$referees",
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
                    _id: "$_id",
                    referees: { $push: "$referees" },
                    totalAmount: { $sum: "$refereeTotal" },
                    totalBetPlaceAmount: { $sum: "$refereeBetPlaceTotal" },
                    refereeDetails: {
                        $push: {
                            referee: "$referees",
                            amount: "$refereeTotal"
                        }
                    }
                }
            },
            {
                $match: {
                    totalAmount: { $lt: 0 },
                    totalBetPlaceAmount: { $lt: -100 }
                }
            },

            // Stage 8: Final projection to match desired output format
            {
                $project: {
                    referrer: "$_id",
                    // referees: 1,
                    revenue: "$totalAmount",
                    totalBets: "$totalBetPlaceAmount",
                    detail: "$refereeDetails",
                    _id: 0
                }
            }
        ]).session(session)
        const data = affiliateRewards.map(v => ({
            startsAt, endsAt, timestamp,
            ...v
        }))
        await affiliateRewardModel.create(data, { session })
        await session.commitTransaction();
        return data
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