import userModel, { correctPassword } from "@/model/user";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "@/utils";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";
import clanWarModel from "@/model/clan/clanwar";
import clanModel from "@/model/clan/clan";

export async function createUser({ username, password, refby }: { username: string, password: string, refby: string }) {
    await connectMongoDB()
    try {
        const newUser = new userModel({
            username,
            fullname: "",
            oddstype: "decimal",
            password,
            balance: 0,
            winstreak: 0,
            role: "user",
            ref: generateReferralCode(),
            refby,
            // firstName: 'John',
            // lastName: 'Doe',
            // email: 'john.doe@example.com',
            // bio: 'Software developer passionate about web technologies',
            // dateOfBirth: new Date('1990-05-15'),
            // gender: 'male',
            // phoneNumber: '+1-555-0123',
            // address: {
            //     street: '123 Main St',
            //     city: 'New York',
            //     state: 'NY',
            //     country: 'USA',
            //     zipCode: '10001'
            // },
            // socialLinks: {
            //     website: 'https://johndoe.dev',
            //     github: 'johndoe123',
            //     linkedin: 'john-doe-dev'
            // },
            // preferences: {
            //     theme: 'dark',
            //     language: 'en',
            //     emailNotifications: true
            // }
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
        // Include password for login verification
        const user = await userModel.findOne({ username })
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
    }
}
export async function findUserByRef(ref: string) {
    await connectMongoDB()
    try {
        // Include password for login verification
        const user = await userModel.findOne({ ref })
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
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
export async function trackBalanceAndBets({ username, betId, amount, session }: { username: string, betId: mongoose.Types.ObjectId, amount: number, session: mongoose.mongo.ClientSession }) {
    await connectMongoDB()
    try {
        const user = await userModel.findOneAndUpdate(
            { username },
            {
                $inc: {
                    balance: amount,
                    bets: 1,
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
        const clanId: string = user.clan.clanId
        await clanModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(clanId),
            {
                $inc: { bets: 1 }
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
                    'clans.$[clan].bets': 1,
                },
                $addToSet: {
                    "clans.$[clan].betIds": betId
                }
            },
            // Array Filters: Specify which elements in the 'clans' array to update
            {
                arrayFilters: [
                    {
                        'clan.clanId': clanId,
                    },
                ],
                session
            }
        )

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