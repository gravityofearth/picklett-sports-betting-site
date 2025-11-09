import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { getClanInfo, leaveClan } from "@/controller/clan";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const { usernameToTransfer } = await request.json()
    const token = request.headers.get('token') || '';
    const { username, clan }: any = jwt.verify(token, JWT_SECRET)
    if (!clan || !clan?.joined) return NextResponse.json({ error: "Not joined" }, { status: 400, statusText: "Not joined" })
    if (clan.role === "owner" && !usernameToTransfer) {
      const members = (await getClanInfo({ _id: new mongoose.Types.ObjectId(clan.clanId as string) }))[0].members
      if (members?.length > 1) return NextResponse.json({ error: "Not allowed" }, { status: 400, statusText: "Owner can't simply leave without transferring ownership" })
    }
    await leaveClan({ clanId: clan.clanId, username, role: clan.role, usernameToTransfer })
    return NextResponse.json("OK", { status: 200 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
