import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { depositClan } from "@/controller/clan";
import { findUserByUsername } from "@/controller/user";

export async function POST(request: NextRequest) {
  try {
    const { id, amount } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const user = await findUserByUsername(username)
    if (!user.clan?.joined) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Not member of the clan" })
    await depositClan({ id, username, amount })
    return NextResponse.json("OK", { status: 201 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
