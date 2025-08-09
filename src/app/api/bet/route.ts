import { signToken } from "@/controller/auth";
import { findBet, findLine, findLineById, placeBet } from "@/controller/bet";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
// This endpoint should be called by a cron job service
export async function POST(request: NextRequest) {
  try {
    const { lineId, side, amount } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const { endsAt } = await findLineById(lineId)
    if (endsAt < new Date().getTime())
      return NextResponse.json({ error: "Bet already ended" }, { status: 400, statusText: "Bet already ended" });
    // calc amount in user profile
    const { bet, user } = await placeBet({ lineId, username, amount, side })
    const new_token = signToken(user)
    return NextResponse.json({ bet, token: new_token }, { status: 201 });

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
