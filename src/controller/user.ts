import userModel, { correctPassword } from "@/model/user";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "@/utils";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
import clanWarModel from "@/model/clan/clanwar";
import clanModel from "@/model/clan/clan";
import appleRefModel from "@/model/appleref";
import balanceTransactionModel from "@/model/balanceTransaction";

export async function createUser({ username, email, emailVerificationToken, password, refby }: { username: string, email: string, emailVerificationToken: string, password: string, refby: string }) {
    await connectMongoDB()
    try {
        const newUser = new userModel({
            username,
            fullname: "",
            email,
            emailVerified: false,
            emailVerificationToken,
            oddstype: "decimal",
            password,
            balance: 0,
            winstreak: 0,
            role: "user",
            ref: generateReferralCode(),
            refby,
            bets: 0, wins: 0, earns: 0,
        });

        const savedUser = await newUser.save();
        return savedUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error
    }
}
export async function findUserByUsername(username: string) {
    await connectMongoDB()
    try {
        const user = await userModel.findOne({ username })
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
    }
}
export async function findUserByRef(ref: string) {
    await connectMongoDB()
    try {
        const user = await userModel.findOne({ ref })
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
    }
}
export async function findUserByAppleRef(ref: string) {
    await connectMongoDB()
    try {
        const user = await appleRefModel.findOne({ ref })
        return user;
    } catch (error) {
        console.error('Error finding apple ref:', error);
    }
}
export async function handleAppleRegistered({ username, appleRef }: { username: string, appleRef: any }) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (!appleRef.active) return
        const active = appleRef.referrees.length < 20 - 1
        await appleRefModel.findOneAndUpdate(
            { ref: appleRef.ref },
            {
                $set: {
                    active
                },
                $push: {
                    referrees: {
                        username,
                        deposited: false
                    }
                }
            },
            { new: true, session }
        )
        const updatedUser = await increaseBalance(appleRef.username, 5, session);
        const newBalance = new balanceTransactionModel({
            username: appleRef.username,
            type: "apple_reward_register",
            amount: 5,
            balanceBefore: updatedUser.balance - 5,
            balanceAfter: updatedUser.balance,
            timestamp: new Date(),
            description: `Apple Reward: $5 ${username} registered`
        })
        await newBalance.save({ session });
        await session.commitTransaction();
    } catch (error) {
        console.error('Error finding apple ref:', error);
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
}
export async function handleAppleDeposited({ username, depositAmount, refby, depositId }: { username: string, depositAmount: number, refby: string, depositId: string }) {
    await connectMongoDB()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const updatedApple = await appleRefModel.findOneAndUpdate(
            {
                username: refby,
                referrees: {
                    $elemMatch: {
                        username: username,
                        deposited: false
                    }
                },
            },
            {
                $set: {
                    "referrees.$[element].deposited": true,
                },
            },
            {
                new: true,
                session,
                arrayFilters: [
                    { "element.username": username }
                ],
            }
        )
        if (!updatedApple) throw new Error("Not AppleRef OR Already Desposited")
        const amount = Math.min(25, depositAmount)
        const updatedUser = await increaseBalance(refby, amount, session);
        const newBalance = new balanceTransactionModel({
            username: refby,
            type: "apple_reward_deposit",
            amount,
            balanceBefore: updatedUser.balance - amount,
            balanceAfter: updatedUser.balance,
            timestamp: new Date(),
            depositId: new mongoose.Types.ObjectId(depositId),
            description: `Apple Reward: ${username} deposited $${depositAmount}`
        })
        await newBalance.save({ session });
        await session.commitTransaction();
    } catch (error) {
        console.error('Error in apple deposit:', error);
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
}
export async function verifyEmailByVerificationToken(token: string) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { emailVerificationToken: token },
            { $set: { emailVerified: true } },
            { new: true }
        )
        return user;
    } catch (error) {
        console.error('Error verifying email:', error);
    }
}
export async function changeUserEmail({ username, email, emailVerificationToken }: { username: string, email: string, emailVerificationToken: string }) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username },
            {
                $set: {
                    email, emailVerificationToken,
                    emailVerified: false
                }
            },
            { new: true }
        )
        return user;
    } catch (error) {
        console.error('Error changing email:', error);
    }
}
export async function updateUsername({ currentUsername, newUsername }: { currentUsername: string, newUsername: string }) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username: currentUsername },
            { $set: { username: newUsername } },
            { new: true })
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
    }
}
export async function updateFullname({ username, fullname }: { username: string, fullname: string }) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username },
            { $set: { fullname } },
            { new: true })
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
    }
}
export async function updateAvatar({ username, avatar }: { username: string, avatar: string }) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username },
            { $set: { avatar } },
            { new: true })
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
    }
}
export async function updateOddstype({ username, oddstype }: { username: string, oddstype: string }) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username },
            { $set: { oddstype } },
            { new: true })
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
    }
}
export async function updatePassword({ username, currentPassword, newPassword }: { username: string, currentPassword: string, newPassword: string }) {
    await connectMongoDB()
    try {
        const user = await userModel.findOne({ username }).select('+password');
        const isPasswordCorrect = await correctPassword(currentPassword, user.password);
        if (!isPasswordCorrect) {
            throw new Error('Your credential is not correct');
        }
        const updated_user = await userModel.findOneAndUpdate(
            { username },
            { $set: { password: await bcrypt.hash(newPassword, 12) } },
            { new: true })
        return updated_user;
    } catch (error) {
        throw error
    }
}

export async function authenticateUser(username: string, password: string) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username },
            { lastLogin: new Date() },
            {
                new: true,
                runValidators: false,
                select: '+password'
            }
        );

        if (!user) {
            throw new Error('Your credential is not correct');
        }

        const isPasswordCorrect = await correctPassword(password, user.password);

        if (!isPasswordCorrect) {
            throw new Error('Your credential is not correct');
        }

        // Remove password from output
        user.password = undefined;

        return user;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}
export async function increaseBalance(username: string, amount: number, session: mongoose.mongo.ClientSession) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username },
            {
                $inc: {
                    balance: amount
                }
            },
            {
                new: true, // Return updated document
                session,
            }
        )
        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error
    }
}
export async function trackBalanceAndBets({ username, insertedBets, amount_sum, session }: { username: string, insertedBets: any[], amount_sum: number, session: mongoose.mongo.ClientSession }) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username },
            {
                $inc: {
                    balance: -amount_sum,
                    bets: insertedBets.length,
                }
            },
            {
                new: true, // Return updated document
                session,
            }
        )
        if (!user) {
            throw new Error('User not found');
        }
        const clanId: string = user.clan?.clanId
        if (clanId) {
            await clanModel.findByIdAndUpdate(
                new mongoose.Types.ObjectId(clanId),
                {
                    $inc: {
                        bets: insertedBets.length,
                        xp: amount_sum,
                    }
                },
                { new: true, session }
            )
            await clanWarModel.updateMany(
                {
                    startsAt: {
                        $gt: new Date().getTime() - 24 * 60 * 60 * 1000,
                        $lt: new Date().getTime(),
                    },
                    'clans.clanId': clanId,
                },
                {
                    $inc: {
                        'clans.$[clan].bets': amount_sum,
                    },
                    $addToSet: {
                        "clans.$[clan].betIds": {
                            $each: insertedBets.map(bet => new mongoose.Types.ObjectId(bet._id as string))
                        }
                    }
                },
                // Array Filters: Specify which elements in the 'clans' array to update
                {
                    arrayFilters: [
                        {
                            'clan.clanId': clanId,
                        },
                    ],
                    session,
                }
            )
        }

        return user;
    } catch (error) {
        console.error('Error updating bets&balance:', error);
        throw error
    }
}
export async function genLeaders() {
    await connectMongoDB()
    try {
        const leaders = await userModel.find({ winstreak: { $gte: 2 } }).select("username winstreak avatar wins earns");
        return leaders
    } catch (error) {
        console.error('Error creating line:', error);
        throw error
    }
}