import { signToken } from "@/controller/auth";
import { updateFullname } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { getCookieResponse, JWT_SECRET } from "@/utils";
export async function PUT(request: NextRequest) {
  try {
    const { fullname } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const updated_user = await updateFullname({ username, fullname })
    const new_token = signToken(updated_user)
    return getCookieResponse({
      response: NextResponse.json({ token: new_token }, { status: 200 }),
      token: new_token,
    })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}