
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { createWithdraw, findWithdraw } from "@/controller/withdraw";
import { findUserByUsername } from "@/controller/user";

export async function POST(request: NextRequest) {
  try {
    const { wallet, amount } = await request.json()
    if (Number(amount) < 20) return NextResponse.json({ error: "Minimum withdrawl amount $20" }, { status: 500, statusText: "Minimum withdrawl amount $20" });
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const user = await findUserByUsername(username)
    if (user.balance < amount) return NextResponse.json({ error: "Insufficient balance for withdrawl" }, { status: 500, statusText: "Insufficient balance for withdrawl" });
    const withdraw = await createWithdraw({ username, wallet, amount })
    return NextResponse.json({ withdraw }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const withdraw = await findWithdraw(username)
    return NextResponse.json({ withdraw }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
