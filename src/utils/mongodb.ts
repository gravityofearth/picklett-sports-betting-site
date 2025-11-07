'use server'
import mongoose from 'mongoose';
import { Scheduler } from 'job-stash';
import { rewardPrizeForEndedWar } from '@/controller/clan';
const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false }).then((mongoose) => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    await Scheduler.init({ db: { address: MONGO_URI } }, { useLock: true });
    await Scheduler.rescheduleJobs(rewardPrizeForEndedWar);
    return cached.conn;
}

export default connectMongoDB;
