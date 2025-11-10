import { Scheduler } from "job-stash";
import { rewardPrizeForEndedWar } from "@/controller/clan";
import connectMongoDB from "./mongodb";
const MONGO_URI = process.env.MONGO_URI || "";
export async function scheduleJob(ts: number, metadata: any) {
    const dateToRun = new Date(ts)
    await connectMongoDB()
    // await Scheduler.init({ db: { address: MONGO_URI } }, { useLock: true }); // Remove in production
    await Scheduler.scheduleJob(rewardPrizeForEndedWar, dateToRun, undefined, metadata);
}