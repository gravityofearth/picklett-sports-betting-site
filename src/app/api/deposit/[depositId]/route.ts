
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { getDepositById } from "@/controller/deposit";
import { signToken } from "@/controller/auth";
import { findUserByUsername } from "@/controller/user";
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const { depositId } = await params;
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const { currency, network, address, depositAmount, lockedPrice, result, confirmations, expiresAt } = await getDepositById(depositId)
    let new_token = ""
    if (result === "success") {
      const user = await findUserByUsername(username)
      new_token = signToken(user)
    }
    return NextResponse.json({ deposit: { currency, network, address, depositAmount, lockedPrice, result, confirmations, expiresAt }, basets: new Date().getTime(), token: new_token }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}