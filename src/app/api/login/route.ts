import { signToken } from "@/controller/auth";
import { authenticateUser, createUser, findUserByUsername } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";

// This endpoint should be called by a cron job service
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
