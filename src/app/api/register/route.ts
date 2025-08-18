import { signToken } from "@/controller/auth";
import { createUser, findUserByRef } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";

// This endpoint should be called by a cron job service
export async function POST(request: NextRequest) {
  try {

    const { username, password, ref } = await request.json()
    if (!username || !password) return NextResponse.json({ error: "Invalid username/password" }, { status: 400, statusText: "Invalid username/password" })
    const referrer = await findUserByRef(ref.trim())
    const user = await createUser({ username, password, refby: referrer?.username })
    const token = signToken(user)
    return NextResponse.json({ token }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    if (error.code === 11000) return NextResponse.json({ error: "Duplicate username" }, { status: 409, statusText: "Username already in use, please choose another" });
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
