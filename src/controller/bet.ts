
import betModel from "@/model/bet";
import lineModel from "@/model/line";
import userModel from "@/model/user";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
import { trackBalanceAndBets } from "./user";
import { createPlaceBetTransaction } from "./balanceTransaction";
import balanceTransactionModel from "@/model/balanceTransaction";
import clanModel from "@/model/clan/clan";
import clanWarModel from "@/model/clan/clanwar";
import clanTxModel from "@/model/clan/clantx";
import { extractTypicalOdds } from "@/utils/line";
import { BetResultType, BetSlipType } from "@/types";
export async function bulkLines_desctructing(operations: any[]) {
    await connectMongoDB()
    try {
        const chunkedOperations = [];
        while (operations.length > 0) {
            chunkedOperations.push(operations.splice(0, 50));
        }
        for (let operation of chunkedOperations) {
            await lineModel.bulkWrite(operation, { ordered: false })
        }
    } catch (error) {
        console.error('Error upserting line:', error);
        throw error
    }
}
export async function findLines({ filter, sort }: { filter: any, sort?: any }) {
    await connectMongoDB()
    try {
        const lines = await lineModel.find(filter).sort(sort)
        return lines;
    } catch (error) {
        console.error('Error finding line:', error);
        throw error
    }
}
export async function updateLinesStatus({ lineIds, status }: { lineIds: string[], status: string }) {
    await connectMongoDB()
    try {
        await lineModel.updateMany(
            {
                _id: { $in: lineIds.map(v => new mongoose.Types.ObjectId(v)) }
            },
            {
                $set: {
                    status
                }
            }
        )
    } catch (error) {
        console.error('Error updating lines status:', error);
        throw error
    }
}
export async function fetchLinesBySports({ sports, isAdmin }: { sports: string, isAdmin: boolean }) {
    await connectMongoDB()
    try {
        let wrappedLines: any[]
        const sportsFilter = sports === "all-sports" ? undefined : { sports }
        const filter = isAdmin ?
            {
                status: { $in: ["live", "pending"] },
                ...sportsFilter,
            } :
            {
                status: "pending",
                startsAt: { $gt: Date.now() },
                ...sportsFilter,
            }
        if (sports === "all-sports") {
            wrappedLines = await lineModel.aggregate([
                {
                    $match: filter
                },
                { $sort: { startsAt: 1 } },
                // { $skip: 250 },
                // { $limit: 10 },
                {
                    $project: {
                        eventId: 1,
                        children: 1,
                        sports: 1,
                        leagueId: 1,
                        leagueName: 1,
                        home: 1,
                        away: 1,
                        startsAt: 1,
                        status: 1,
                        odds: {
                            odds_regular: "$odds_regular",
                            odds_sets: "$odds_sets",
                            odds_corners: "$odds_corners",
                            odds_games: "$odds_games",
                            odds_points: "$odds_points",
                            odds_bookings: "$odds_bookings",
                            odds_daily_total: "$odds_daily_total",
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: "$$ROOT"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        league: 'All',
                        data: 1,
                    }
                },
            ])
        } else {
            wrappedLines = await lineModel.aggregate([
                {
                    $match: filter
                },
                {
                    $project: {
                        eventId: 1,
                        children: 1,
                        sports: 1,
                        leagueId: 1,
                        leagueName: 1,
                        home: 1,
                        away: 1,
                        startsAt: 1,
                        status: 1,
                        odds: {
                            odds_regular: "$odds_regular",
                            odds_sets: "$odds_sets",
                            odds_corners: "$odds_corners",
                            odds_games: "$odds_games",
                            odds_points: "$odds_points",
                            odds_bookings: "$odds_bookings",
                            odds_daily_total: "$odds_daily_total",
                        }
                    }
                },
                {
                    $group: {
                        _id: '$leagueName',
                        data: {
                            $push: "$$ROOT"
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        league: '$_id',
                        data: 1,
                    }
                },
            ])
        }
        wrappedLines.forEach(wL => {
            wL.data.forEach((line: any) => extractTypicalOdds(line))
        })
        return wrappedLines
            .map((wrappedLine) => ({
                ...wrappedLine,
                data: wrappedLine.data.filter((line: any) => line.odds)
            }))
            .filter(wL => wL.data.length > 0);
    } catch (error) {
        console.error('Error fetching line:', error);
        throw error
    }
}
export async function getLineCountBySports(isAdmin: boolean) {
    await connectMongoDB()
    const filter = isAdmin ?
        { status: { $in: ["live", "pending"] } } :
        { status: 'pending' }
    try {
        const lines = await lineModel.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id: '$sports',
                    count: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: [{ $type: "$odds_regular" }, "string"] },
                                        { $eq: [{ $type: "$odds_sets" }, "string"] },
                                        { $eq: [{ $type: "$odds_corners" }, "string"] },
                                        { $eq: [{ $type: "$odds_games" }, "string"] },
                                        { $eq: [{ $type: "$odds_points" }, "string"] },
                                        { $eq: [{ $type: "$odds_bookings" }, "string"] },
                                        { $eq: [{ $type: "$odds_daily_total" }, "string"] },
                                    ]
                                },
                                1, 0
                            ]
                        }
                    },
                    data: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    _id: 0,
                    sports: '$_id',
                    count: 1,
                }
            }
        ])
        const sum = lines.reduce((prev, cur) => (prev + cur.count), 0)
        lines.push({ count: sum, sports: "all-sports" })
        return lines;
    } catch (error) {
        console.error('Error getting line count by sports', error);
        throw error
    }
}
export async function findLineById(id: string) {
    await connectMongoDB()
    try {
        const line = await lineModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $project: {
                    eventId: 1,
                    children: 1,
                    sports: 1,
                    leagueId: 1,
                    leagueName: 1,
                    home: 1,
                    away: 1,
                    startsAt: 1,
                    status: 1,
                    odds: {
                        odds_regular: "$odds_regular",
                        odds_sets: "$odds_sets",
                        odds_corners: "$odds_corners",
                        odds_games: "$odds_games",
                        odds_points: "$odds_points",
                        odds_bookings: "$odds_bookings",
                        odds_daily_total: "$odds_daily_total",
                    }
                }
            }
        ])
        return line[0];
    } catch (error) {
        console.error('Error finding line:', error);
        throw error
    }
}
export async function cancelLine({ id: lineId }: { id: string }) {
    await connectMongoDB()
    try {
        const line = await lineModel.findById(new mongoose.Types.ObjectId(lineId))
        if (!["pending", "live"].includes(line.status)) throw new Error("Operation Failed")
        const username_bets_arr: { username: string, bets: any[] }[] = await betModel.aggregate([
            { $match: { lineId: new mongoose.Types.ObjectId(lineId) } },
            {
                $group: {
                    _id: "$username",
                    bets: {
                        $push: "$$ROOT"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    username: "$_id",
                    bets: 1,
                }
            }
        ])
        const resolve: resolveType = {
            betResolver: {},
            lineId,
            status: "cancelled"
        }
        for (let username_bets of username_bets_arr) {
            resolve.betResolver[username_bets.username] = username_bets.bets.filter(bet => bet.result === "pending").map(bet => ({ bet, result: "cancelled" }))
        }
        resolveBetsforLineId(resolve)
    } catch (error) {
        console.error('Error cancelling bet:', error);
        throw error
    }
}
export async function placeBet({ betSlips, username }: { betSlips: BetSlipType[], username: string }) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = await userModel.findOne({ username }).session(session);
        const amount_sum = betSlips.reduce((sum, cur) => (sum + Number(cur.amount)), 0)
        if (!user || user.balance < amount_sum) {
            throw new Error('Insufficient balance');
        }
        const now = Date.now()
        const insertedBets = await betModel.insertMany(
            betSlips.map(({ lineId, unit, num, description, oddsName, point, team_total_point, value, index, amount }, i) => ({
                username, result: "pending",
                lineId: new mongoose.Types.ObjectId(lineId),
                unit, num, description, oddsName, point, team_total_point, value, index, amount: Number(amount),
                createdAt: new Date(now + i), updatedAt: new Date(now + i)
            })),
            { session, lean: true }
        );
        const updatedUser = await trackBalanceAndBets({ username, insertedBets, amount_sum, session });
        await createPlaceBetTransaction({
            username, insertedBets, origin_balance: user.balance, session,
        })
        await session.commitTransaction();
        return {
            user: updatedUser
        }
    } catch (error) {
        console.error('Error placing bet:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}
export async function getWrappedBetsByLineIds(lineIds: string[]) {
    await connectMongoDB()
    try {
        const bets = await betModel.aggregate([
            {
                $match: {
                    lineId: { $in: lineIds.map(v => new mongoose.Types.ObjectId(v)) }
                }
            },
            {
                $group: {
                    _id: '$lineId',
                    bets: {
                        $push: "$$ROOT"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    lineId: '$_id',
                    bets: 1,
                }
            },
        ])
        return bets;
    } catch (error) {
        console.error('Error getting wrapped bets by lineId:', error);
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
                    lineId: 1,
                    unit: 1,
                    num: 1,
                    description: 1,
                    oddsName: 1,
                    point: 1,
                    team_total_point: 1,
                    value: 1,
                    index: 1,
                    amount: 1,
                    result: 1,
                    lineData: 1,
                    createdAt: 1,
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
type resolveType = {
    betResolver: {
        [username: string]: {
            bet: any;
            result: BetResultType;
        }[]
    };
    lineId: string; status: string;
}
export async function resolveBetsforLineId({ betResolver, lineId, status }: resolveType) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await lineModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(lineId),
            { $set: { status } },
            { session }
        )
        const betUpdates: any[] = []
        const userUpdates: any[] = []
        const balanceTxs: any[] = []
        const clanUpdates: any[] = []
        const clTxs: any[] = []
        const warUpdates: any[] = []
        for (let username in betResolver) {
            const user = (await userModel.aggregate([
                {
                    $match: { username }
                },
                {
                    $lookup: {
                        from: "clans",
                        localField: "clan.clanId",
                        foreignField: "_id",
                        as: "currentClan"
                    }
                },
                {
                    $unwind: {
                        path: "$currentClan",
                        preserveNullAndEmptyArrays: true
                    }
                },
            ]).session(session))[0];
            let winstreak = user.winstreak;
            let balanceBefore = user.balance;
            let totalWinning = 0;
            let totalEarn = 0;
            let wins = 0
            let refunds = 0
            for (let { bet, result } of betResolver[username]) {
                betUpdates.push({
                    updateOne: {
                        filter: { _id: new mongoose.Types.ObjectId(bet._id as string) },
                        update: { $set: { result } },
                    }
                })
                winstreak = result === "win" ? (winstreak + 1) : 0
                if (result === "win") {
                    const winning = bet.amount * bet.value
                    const earn = winning - bet.amount
                    const tax = user.currentClan?.level && user.currentClan.level > 1 ? earn * 0.001 : 0
                    const amount = winning - tax
                    const balanceAfter = balanceBefore + amount
                    balanceTxs.push({
                        username,
                        type: "bet_win",
                        amount,
                        balanceBefore,
                        balanceAfter,
                        timestamp: new Date(),
                        lineId: new mongoose.Types.ObjectId(lineId),
                        betId: new mongoose.Types.ObjectId(bet._id as string),
                        description: `Bet win: $${bet.amount}*${bet.value}-$${tax}=$${amount}`
                    })
                    balanceBefore = balanceAfter
                    totalWinning += winning
                    totalEarn += earn
                    wins++
                } else if (result === "draw" || result === "cancelled") {
                    const amount = bet.amount
                    const balanceAfter = balanceBefore + amount
                    balanceTxs.push({
                        username,
                        type: result === "draw" ? "bet_draw_refund" : "bet_cancelled",
                        amount,
                        balanceBefore,
                        balanceAfter,
                        timestamp: new Date(),
                        lineId: new mongoose.Types.ObjectId(lineId),
                        betId: new mongoose.Types.ObjectId(bet._id as string),
                        description: `${result === "draw" ? "Bet draw refund" : "Bet Cancelled"}: $${amount}`
                    })
                    balanceBefore = balanceAfter
                    refunds += amount
                }
            }
            const tax = user.currentClan?.level && user.currentClan.level > 1 ? totalEarn * 0.001 : 0
            const clanContribution = tax > 0 ? { "clan.contribution": tax } : undefined
            userUpdates.push({
                updateOne: {
                    filter: { username },
                    update: {
                        $inc: {
                            balance: totalWinning - tax + refunds,
                            wins,
                            earns: totalEarn,
                            // "clan.contribution": tax,
                            ...clanContribution,
                        },
                        $set: {
                            winstreak,
                            lastUpdated: new Date()
                        }
                    }
                }
            })
            if (user.clan) {
                clanUpdates.push({
                    updateOne: {
                        filter: { _id: new mongoose.Types.ObjectId(user.clan.clanId as string) },
                        update: {
                            $inc: {
                                wins,
                                coffer: tax,
                            },
                        }
                    }
                })
                warUpdates.push({
                    updateMany: {
                        filter: {
                            startsAt: {
                                $gt: Date.now() - 24 * 60 * 60 * 1000,
                                $lt: Date.now(),
                            },
                            'clans.clanId': new mongoose.Types.ObjectId(user.clan.clanId as string),
                        },
                        update: {
                            $inc: {
                                'clans.$[clan].wins': wins,
                            },
                        },
                        arrayFilters: [
                            {
                                'clan.clanId': new mongoose.Types.ObjectId(user.clan.clanId as string),
                            },
                        ],
                    }
                })
                if (user.currentClan.level > 1) {
                    clTxs.push({
                        clanId: new mongoose.Types.ObjectId(user.clan.clanId as string),
                        type: "tax",
                        timestamp: Date.now(),
                        cofferBefore: user.currentClan.coffer,
                        cofferAfter: user.currentClan.coffer + tax,
                        username,
                        amount: tax,
                    })
                }
            }
        }
        await betModel.bulkWrite(betUpdates, { ordered: true, session })
        await userModel.bulkWrite(userUpdates, { ordered: true, session })
        await clanModel.bulkWrite(clanUpdates, { ordered: true, session })
        await clanWarModel.bulkWrite(warUpdates, { ordered: true, session })
        await balanceTransactionModel.insertMany(balanceTxs, { ordered: true, session, lean: true });
        await clanTxModel.insertMany(clTxs, { ordered: true, session, lean: true });
        await session.commitTransaction();
    } catch (error) {
        console.error('Error resolving bet:', error);
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}
