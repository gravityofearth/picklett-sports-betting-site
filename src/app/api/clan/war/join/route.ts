import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { findWars, joinWar } from "@/controller/clan";
import { findUserByUsername } from "@/controller/user";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const { warId, clanId, members } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const owner = await findUserByUsername(username)
    const checkClanOwnership = owner.clan && owner.clan.joined && owner.clan.clanId.toString() === clanId && ["owner", "elder"].includes(owner.clan.role)
    if (!checkClanOwnership) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Unable action" })
    const war = (await findWars({ _id: new mongoose.Types.ObjectId(warId as string) }))[0]
    const clan_length = war.clans ? war.clans.length : 0
    if (war.slots === clan_length) return NextResponse.json({ error: "Slots full" }, { status: 400, statusText: "All slots are in full" })
    if (war.minMembers !== members.length) return NextResponse.json({ error: "Bad request" }, { status: 400, statusText: "Mismatching members" })
    if (war.clans?.find((v: any) => v.clanId.toString() === clanId)) return NextResponse.json({ error: "Already joined" }, { status: 400, statusText: "Already joined" });
    const startsAt = war.slots - clan_length === 1 ? (new Date().getTime() + 1 * 60 * 60 * 1000) : 0
    await joinWar({ warId, clanId, members, startsAt, stake: war.stake })
    return NextResponse.json("OK", { status: 200 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
