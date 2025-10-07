
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { createDeposit, detectDeposit } from "@/controller/deposit";

export async function POST(request: NextRequest) {
  try {
    const { currency, network } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const deposit = await createDeposit({ username, currency, network })
    const { _id: id } = deposit
    detectDeposit(deposit)
    return NextResponse.json({ id }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}