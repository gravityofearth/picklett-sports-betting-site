import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { findRedemptionByCode, redeemCode } from "@/controller/redemption";
import { signToken } from "@/controller/auth";
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const matching_redemption = await findRedemptionByCode(code)
    if (!matching_redemption) return NextResponse.json({ error: "Not found code" }, { status: 400, statusText: "Not found code" });
    if (matching_redemption.status === "redeemed") return NextResponse.json({ error: "Code already redeemed" }, { status: 400, statusText: "Code already redeemed" });
    const { redemption, updatedUser } = await redeemCode({ code, username })
    const new_token = signToken(updatedUser)
    return NextResponse.json({ redemption, token: new_token }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}