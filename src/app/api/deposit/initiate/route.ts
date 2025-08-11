
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { createDeposit } from "@/controller/deposit";

export async function POST(request: NextRequest) {
  try {
    const { sender, depositAmount } = await request.json()
    if (depositAmount < 5) return NextResponse.json({ error: "Minimum deposit amount is $5" }, { status: 400, statusText: "Minimum deposit amount is $5" });
    if (depositAmount > 50) return NextResponse.json({ error: "Maximum deposit amount is $50" }, { status: 400, statusText: "Maximum deposit amount is $50" });
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const deposit = await createDeposit({ username, sender, depositAmount })
    return NextResponse.json({ deposit }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}