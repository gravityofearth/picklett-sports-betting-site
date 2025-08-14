import { signToken } from "@/controller/auth";
import { authenticateUser, findUserByUsername } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";

export async function POST(request: NextRequest) {
  try {

    const { username, password } = await request.json()
    if (!username || !password) return NextResponse.json({ error: "Invalid username/password" }, { status: 400, statusText: "Invalid username/password" })
    const user = await authenticateUser(username, password)
    const token = signToken(user)
    return NextResponse.json({ token }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
export async function GET(request: NextRequest) {
  try {
    const request_token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(request_token, JWT_SECRET)
    const user = await findUserByUsername(username)
    const token = signToken(user)
    return NextResponse.json({ token }, { status: 200 });

  } catch (error: any) {
    console.error("Error finding user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
