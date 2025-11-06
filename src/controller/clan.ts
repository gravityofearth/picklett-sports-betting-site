import balanceTransactionModel from "@/model/balanceTransaction"
import clanModel from "@/model/clan/clan"
import clanTxModel from "@/model/clan/clantx"
import clanWarModel from "@/model/clan/clanwar"
import userModel from "@/model/user"
import connectMongoDB from "@/utils/mongodb"
import mongoose from "mongoose"

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
        ])
        return clans
    } catch (error) {
        console.error('Error finding clans:', error)
        throw error
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
export async function depositClan({ id, username, amount }: { id: string, username: string, amount: number }) {
    await connectMongoDB()
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await clanModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            {
                $inc: { coffer: amount }
            },
            { new: true, session }
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
        await clanModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(id),
            {
                $inc: { coffer: -amount }
            },
            { new: true, session }
        )
        const newClanTx = new clanTxModel({
            clanId: id,
            type: "distribute",
            timestamp: new Date().getTime(),
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
                                                title: { $arrayElemAt: ["$clanInfo.title", "$$clanInfoIndex"] },
                                                icon: { $arrayElemAt: ["$clanInfo.icon", "$$clanInfoIndex"] },
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
            amount: stake,
        })
        await newClanTx.save({ session })

        await session.commitTransaction()
        // setTimeout(() => endWar(warId), 1 * 60 * 60 * 1000) //TODO:
    } catch (error) {
        console.error('Error joining war:', error)
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}