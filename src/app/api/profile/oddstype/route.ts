import { signToken } from "@/controller/auth";
import { updateOddstype } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
export async function PUT(request: NextRequest) {
  try {
    const { oddstype } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const updated_user = await updateOddstype({ username, oddstype })
    const new_token = signToken(updated_user)
    return NextResponse.json({ token: new_token }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}