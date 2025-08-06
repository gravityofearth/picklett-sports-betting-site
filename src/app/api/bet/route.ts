import { signToken } from "@/controller/auth";
import { createBet, createLine, findBet, findLine, findLineById } from "@/controller/bet";
import { createUser, findUserByUsername, reduceUserBalance } from "@/controller/user";
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
    const user = await reduceUserBalance(username, amount)
    const new_token = signToken(user)
    // calc amount in user profile
    const bet = await createBet({ lineId, username, amount, side })
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
