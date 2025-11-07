import { Scheduler } from "job-stash";
import { rewardPrizeForEndedWar } from "@/controller/clan";
export async function scheduleJob(ts: number, metadata: any) {
    const dateToRun = new Date(ts)
    await Scheduler.scheduleJob(rewardPrizeForEndedWar, dateToRun, undefined, metadata);
}