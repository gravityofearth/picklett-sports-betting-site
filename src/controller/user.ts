import userModel from "@/model/user";
import connectMongoDB from "@/utils/mongodb";
import mongoose from "mongoose";

export async function createUser({ username, password }: { username: string, password: string }) {
    await connectMongoDB()
    try {
        const newUser = new userModel({
            username,
            password,
            balance: 0,
            winstreak: 0,
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
        const user = await userModel.findOne({ username }).select('+password');
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
    }
}
export async function authenticateUser(username: string, password: string) {
    await connectMongoDB()
    try {
        const user = await userModel.findOne({ username }).select('+password');

        if (!user) {
            throw new Error('Your credential is not correct');
        }

        const isPasswordCorrect = await user.correctPassword(password, user.password);

        if (!isPasswordCorrect) {
            throw new Error('Your credential is not correct');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

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
export async function genLeaders() {
    await connectMongoDB()
    try {
        const leaders = await userModel.find({ winstreak: { $gte: 2 } }).sort({ winstreak: -1 })
        return leaders;
    } catch (error) {
        console.error('Error generating leaders:', error);
        throw error
    }
}