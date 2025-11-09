import balanceTransactionModel from "@/model/balanceTransaction"
import clanModel from "@/model/clan/clan"
import clanTxModel from "@/model/clan/clantx"
import clanWarModel from "@/model/clan/clanwar"
import userModel from "@/model/user"
import connectMongoDB from "@/utils/mongodb"
import mongoose from "mongoose"
import { findUserByUsername } from "./user"
import { sendEmail } from "@/utils/emailjs"
import { scheduleJob } from "@/utils/scheduler"

export async function createClan({ title, ownerUserName, description, icon }: { title: string, ownerUserName: string, description: string, icon: string }) {
    await connectMongoDB()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const newClan = new clanModel({
            title, ownerUsername: ownerUserName, description, icon,
            coffer: 0, xp: 0, level: 1, wins: 0, bets: 0,
        })
        const savedClan = await newClan.save({ session })
        const user = await userModel.findOneAndUpdate(
            { username: ownerUserName },
            {
                $set: {
                    clan: {
                        clanId: savedClan._id,
                        joined: true,
                        role: "owner",
                        contribution: 0,
                        timestamp: new Date().getTime()
                    },
                },
                $inc: {
                    balance: -50
                }
            },
            { session }
        )
        if (user.balance < 50) {
            throw new Error("Insufficient balance to create clan")
        }
        const blTx = new balanceTransactionModel({
            username: ownerUserName,
            type: 'clan_created',
            amount: -50,
            balanceBefore: user.balance,
            balanceAfter: user.balance - 50,
            clanId: newClan._id,
            timestamp: new Date(),
            description: `Create Clan:${title}`
        })
        await blTx.save({ session })
        await session.commitTransaction()
        return savedClan
    } catch (error) {
        console.error('Error creating clan:', error)
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}
export async function editClan({ description, icon, clanId }: { description: string, icon: string, clanId: string }) {
    await connectMongoDB()
    try {
        const clans = await clanModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(clanId),
            {
                $set: {
                    description, icon
                }
            }
        )
        return clans
    } catch (error) {
        console.error('Error finding clans:', error)
        throw error
    }
}
export async function findClans(filter: any) {
    await connectMongoDB()
    try {
        const clans = await clanModel.find(filter)
        return clans
    } catch (error) {
        console.error('Error finding clans:', error)
        throw error
    }
}
export async function getClanInfo(filter: any) {
    await connectMongoDB()
    try {
        const clans = await clanModel.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "users",
                    let: { clanId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$clan.clanId", "$$clanId"],
                                }
                            }
                        },
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                                clan: 1,
                                bets: 1,
                                wins: 1,
                                earns: 1,
                            }
                        }
                    ],
                    as: "members",
                }
            },
            {
                $sort: { wins: -1 }
            }
        ])
        return clans
    } catch (error) {
        console.error('Error finding clans:', error)
        throw error
    }
}
export async function getClanRank(wins: number) {
    try {
        const higherRankCount = await clanModel.countDocuments({
            wins: { $gt: wins }
        })
        const rank = higherRankCount + 1
        return rank
    } catch (error) {
        console.error('Error fetching user rank:', error);
        throw error;
    }
}
export async function joinClan({ username, id }: { username: string, id: string }) {
    await connectMongoDB()
    try {
        await userModel.findOneAndUpdate({ username }, {
            $set: {
                clan: {
                    clanId: id,
                    joined: false,
                    role: "member",
                    contribution: 0,
                    timestamp: new Date().getTime()
                },
            }
        }, { new: true })
    } catch (error) {
        console.error('Error joining clan:', error)
        throw error
    }
}
export async function operateClanJoin({ username, id, isApproved }: { username: string, id: string, isApproved: boolean }) {
    await connectMongoDB()
    try {
        await userModel.findOneAndUpdate(
            { username, "clan.clanId": id }, // Find by username and matching clanId
            isApproved ?
                { $set: { "clan.joined": true } }
                :
                { $unset: { clan: "" } },
            { new: true }
        )
    } catch (error) {
        console.error('Error joining clan:', error)
        throw error
    }
}
export async function promoteClanMember({ username, clanId, role }: { username: string, clanId: string, role: "elder" | "member" }) {
    await connectMongoDB()
    try {
        await userModel.findOneAndUpdate(
            { username, "clan.clanId": clanId },
            { $set: { "clan.role": role } },
            { new: true }
        )
    } catch (error) {
        console.error('Error promoting clan member:', error)
        throw error
    }
}
export async function kickClanMember({ username, clanId }: { username: string, clanId: string }) {
    await connectMongoDB()
    try {
        await userModel.findOneAndUpdate(
            { username, "clan.clanId": clanId },
            { $unset: { clan: "" } },
            { new: true }
        )
    } catch (error) {
        console.error('Error promoting clan member:', error)
        throw error
    }
}
export async function leaveClan({ clanId, username, role, usernameToTransfer }: { clanId: string, username: string, role: string, usernameToTransfer?: string }) {
    await connectMongoDB()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const clanwars = await clanWarModel.find({
            startsAt: {
                $gt: new Date().getTime() - 24 * 60 * 60 * 1000,
                // $lt: new Date().getTime(),
            },
            clans: {
                $elemMatch: {
                    clanId: new mongoose.Types.ObjectId(clanId),
                    members: username,
                }
            }
        })
        if (clanwars.length > 0) throw new Error("You are participating in clan war now.")
        const userClanUpdate: any[] = [{
            updateOne: {
                filter: { username },
                update: {
                    $unset: {
                        clan: ''
                    },
                }
            }
        }]
        if (role === "owner") {
            if (usernameToTransfer) {
                const targetUser = await findUserByUsername(usernameToTransfer)
                if (!targetUser.clan || targetUser.clan.clanId.toString() !== clanId) throw new Error("Can't transfer ownership to who are not in the same clan")
                userClanUpdate.push({
                    updateOne: {
                        filter: { username: usernameToTransfer },
                        update: {
                            $set: {
                                clan: {
                                    clanId,
                                    joined: true,
                                    role: "owner",
                                    contribution: 0,
                                    timestamp: new Date().getTime()
                                },
                            }
                        }
                    }
                })
            } else {
                await clanModel.findByIdAndDelete(new mongoose.Types.ObjectId(clanId), { session });
            }
        }
        await userModel.bulkWrite(userClanUpdate, { session })
        await session.commitTransaction()
    } catch (error) {
        console.error('Error leaving clan:', error)
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}
export async function depositClan({ id, username, amount }: { id: string, username: string, amount: number }) {
    await connectMongoDB()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const clan = await clanModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            {
                $inc: { coffer: amount }
            },
            { session }
        )
        const user = await userModel.findOneAndUpdate(
            { username },
            {
                $inc: {
                    "clan.contribution": amount,
                    balance: -amount,
                }
            },
            { session }
        )
        if (user.balance < amount) {
            throw new Error("Insufficient balance to deposit")
        }
        const newClanTx = new clanTxModel({
            clanId: id,
            type: "deposit",
            timestamp: new Date().getTime(),
            cofferBefore: clan.coffer,
            cofferAfter: clan.coffer + amount,
            username, amount,
        })
        await newClanTx.save({ session })
        const blTx = new balanceTransactionModel({
            username,
            type: 'clan_deposit',
            amount: -amount,
            balanceBefore: user.balance,
            balanceAfter: user.balance - amount,
            clanId: id,
            timestamp: new Date(),
            description: `Deposit $${amount} into Clan`
        })
        await blTx.save({ session })
        await session.commitTransaction()
    } catch (error) {
        console.error('Error joining clan:', error)
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}
export async function distributeClan({ id, selectedMember, amount }: { id: string, selectedMember: string, amount: number }) {
    await connectMongoDB()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const clan = await clanModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            {
                $inc: { coffer: -amount }
            },
            { session }
        )
        const newClanTx = new clanTxModel({
            clanId: id,
            type: "distribute",
            timestamp: new Date().getTime(),
            cofferBefore: clan.coffer,
            cofferAfter: clan.coffer - amount,
            username: selectedMember, amount,
        })
        await newClanTx.save({ session })
        if (selectedMember) {
            const user = await userModel.findOneAndUpdate(
                { username: selectedMember },
                {
                    $inc: {
                        balance: amount,
                    }
                },
                { session }
            )
            const blTx = new balanceTransactionModel({
                username: selectedMember,
                type: 'clan_distribute',
                amount,
                balanceBefore: user.balance,
                balanceAfter: user.balance + amount,
                clanId: id,
                timestamp: new Date(),
                description: `Distribute $${amount} from Clan`
            })
            await blTx.save({ session })
        } else {
            const selectedMembers = await userModel.find({ "clan.clanId": new mongoose.Types.ObjectId(id) }).select("username balance").session(session)
            const memberCount = selectedMembers.length
            const amount_per_member = Math.floor(amount / memberCount * 100) / 100
            const balanceUpdates = selectedMembers.map(({ username }) => ({
                updateOne: {
                    filter: { username },
                    update: {
                        $inc: {
                            balance: amount_per_member,
                        }
                    }
                }
            }))
            await userModel.bulkWrite(balanceUpdates, { session })
            const blTxs = selectedMembers.map(member => ({
                username: member.username,
                type: 'clan_distribute',
                amount: amount_per_member,
                balanceBefore: member.balance,
                balanceAfter: member.balance + amount_per_member,
                clanId: id,
                timestamp: new Date(),
                description: `Distribute $${amount}/${memberCount}=$${amount_per_member} from Clan: To all members`
            }));
            await balanceTransactionModel.insertMany(blTxs, { session });

        }
        await session.commitTransaction()
    } catch (error) {
        console.error('Error joining clan:', error)
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}
export async function createWar({ prize, stake, slots, minMembers }: { prize: number, stake: number, slots: number, minMembers: number }) {
    await connectMongoDB()
    try {
        const newWar = new clanWarModel({
            prize, stake, slots, minMembers,
            type: "24h",
            clan: [],
            startsAt: 0,
            rewarded: "unpaid",
        })
        const savedWar = await newWar.save()
        return savedWar
    } catch (error) {
        console.error('Error creating clan war:', error)
        throw error
    }
}
export async function findWars(filter: any) {
    await connectMongoDB()
    try {
        const wars = await clanWarModel.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "clans", // The name of your clans collection
                    localField: "clans.clanId", // Get all clanIds from the clans array
                    foreignField: "_id", // Match against the _id field in the clans collection
                    as: "clanInfo" // Store the matched clan documents in a temporary array
                }
            },
            {
                $addFields: {
                    clans: {
                        $map: {
                            input: "$clans", // The original clans array
                            as: "clan", // The variable for the current clan object
                            in: {
                                $let: {
                                    vars: {
                                        clanInfoIndex: { $indexOfArray: ["$clanInfo._id", "$$clan.clanId"] }
                                    },
                                    in: {
                                        $mergeObjects: [
                                            "$$clan",
                                            {
                                                title: {
                                                    $cond: {
                                                        if: { $eq: ["$$clanInfoIndex", -1] },
                                                        then: "Removed Clan",
                                                        else: { $arrayElemAt: ["$clanInfo.title", "$$clanInfoIndex"] }
                                                    }
                                                },
                                                icon: {
                                                    $cond: {
                                                        if: { $eq: ["$$clanInfoIndex", -1] },
                                                        then: "placeholder",
                                                        else: { $arrayElemAt: ["$clanInfo.icon", "$$clanInfoIndex"] }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    clanInfo: 0 // Remove the temporary array
                }
            }
        ])
        return wars
    } catch (error) {
        console.error('Error finding clans:', error)
        throw error
    }
}
export async function getWarFeeds(warId: string) {
    await connectMongoDB()
    try {
        const feeds = await clanWarModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(warId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "clans.members",
                    foreignField: "username",
                    as: "userInfo"
                }
            },
            {
                $lookup: {
                    from: "bets",
                    localField: "clans.betIds",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $match: {
                                status: { $ne: "pending" },
                            },
                        }
                    ],
                    as: "betInfo"
                }
            },
            {
                $lookup: {
                    from: "lines",
                    localField: "betInfo.lineId",
                    foreignField: "_id",
                    as: "lineInfo"
                }
            },
            {
                $project: {
                    "userInfo.username": 1,
                    "userInfo.avatar": 1,
                    "betInfo.username": 1,
                    "betInfo.lineId": 1,
                    "betInfo.amount": 1,
                    "betInfo.status": 1,
                    "betInfo.createdAt": 1,
                    "lineInfo._id": 1,
                    "lineInfo.event": 1,
                }
            },
        ])
        return feeds[0]
    } catch (error) {
        console.error('Error finding feeds:', error)
        throw error
    }
}
export async function joinWar({ warId, clanId, members, startsAt, stake }: { warId: string, clanId: string, members: string[], startsAt: number, stake: number }) {
    await connectMongoDB()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const wars = await clanWarModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(warId),
            {
                $push: {
                    clans: {
                        clanId: new mongoose.Types.ObjectId(clanId),
                        members,
                        wins: 0, bets: 0,
                        betIds: [],
                    }
                },
                $set: {
                    startsAt
                }
            }, { new: true, session })
        /*
        await clanWarModel.findOneAndUpdate( //Note: add to members
            { _id: warId, "clans.clanId": clanIdToUpdate },
            {
                $addToSet: {
                    "clans.$.members": newMember
                }
            },
            { new: true }
        );
         */

        const clan = await clanModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(clanId),
            {
                $inc: { coffer: -stake }
            },
            { new: true, session }
        )
        if (clan.coffer < 0) throw new Error("Insufficient coffer balance for stake")
        const newClanTx = new clanTxModel({
            clanId, warId,
            type: "stake",
            timestamp: new Date().getTime(),
            cofferBefore: clan.coffer + stake,
            cofferAfter: clan.coffer,
            amount: stake,
        })
        await newClanTx.save({ session })

        await session.commitTransaction()
        if (startsAt > 0) await scheduleJob(startsAt + 24 * 60 * 60 * 1000, warId)
    } catch (error) {
        console.error('Error joining war:', error)
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}
export async function rewardPrizeForEndedWar(job: any) {
    await connectMongoDB()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const { warId }: { warId: string } = job
        const { prize, clans } = await clanWarModel.findById(new mongoose.Types.ObjectId(warId)).session(session)
        clans.sort((b: any, a: any) => a.wins - b.wins)
        const wonClan = clans[0]
        if (wonClan.wins === clans[1].wins) {
            sendEmail(warId)
            throw new Error("War drawn")
        }
        const clan = await clanModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(wonClan.clanId as string),
            {
                $inc: { coffer: prize }
            },
            { session }
        )
        const newClanTx = new clanTxModel({
            clanId: wonClan.clanId,
            warId,
            type: "prize",
            timestamp: new Date().getTime(),
            cofferBefore: clan.coffer,
            cofferAfter: clan.coffer + prize,
            amount: prize,
        })
        const savedClanTx = await newClanTx.save({ session })
        await clanWarModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(warId),
            {
                $set: { rewarded: savedClanTx._id.toString() }
            },
            { new: true, session }
        )
        await session.commitTransaction()
    } catch (error) {
        console.error('Error rewarding prize for war:', error)
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}
export async function getClanTxs({ clanId }: { clanId: string }) {
    await connectMongoDB()
    try {
        const clanTxs = await clanTxModel.find({ clanId: new mongoose.Types.ObjectId(clanId) }).sort({ timestamp: -1 })
        return clanTxs
    } catch (error) {
        console.error('Error finding clanTxs:', error)
        throw error
    }
}