import { signToken } from "@/controller/auth";
import { findBet, findLines, placeBet } from "@/controller/bet";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { getCookieResponse, JWT_SECRET, signOdd } from "@/utils";
import { BetSlipType } from "@/types";
import mongoose from "mongoose";
export async function POST(request: NextRequest) {
  try {
    const { data: betSlips }: { data: BetSlipType[] } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    if (betSlips.some(betSlip => (Number(betSlip.amount) < 5 || Number(betSlip.amount) > 50))) return NextResponse.json({ error: "Out of range" }, { status: 400, statusText: "Minimum $5, Maximum $50" });
    const lines = await findLines({ filter: { _id: { $in: betSlips.map(b => new mongoose.Types.ObjectId(b.lineId)) } } })
    if (lines.some(line => line.startsAt < new Date().getTime()))
      return NextResponse.json({ error: "Bet already ended" }, { status: 400, statusText: "Bet already ended" });
    /* NOTE: check odds hash */
    if (betSlips.some(({ lineId, num, oddsName, point, value, hash, index }) => {
      const eventId = lines.find(line => line._id.toString() === lineId).eventId
      const ou_ha = [
        oddsName.includes("total") ? "over" : "home",
        oddsName.includes("total") ? "under" : "away"
      ][index]
      return hash !== signOdd({ eventId, period_num: num, oddsName, point, ou_ha, value })
    })) {
      console.error("Data malformed");
      return NextResponse.json({ error: "Bad request" }, { status: 400, statusText: "Data malformed" });
    }

    const { user } = await placeBet({ betSlips, username })
    const new_token = signToken(user)
    return getCookieResponse({
      response: NextResponse.json({ token: new_token }, { status: 201 }),
      token: new_token
    })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    if (error.message.includes("Insufficient balance."))
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400, statusText: "Insufficient balance" });
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const bet = await findBet(username)
    return NextResponse.json({ bet }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
