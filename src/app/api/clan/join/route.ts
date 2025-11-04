import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { findClans, joinClan } from "@/controller/clan";
import { findUserByUsername } from "@/controller/user";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const clan = await findClans({ _id: id })
    if (!clan) return NextResponse.json({ error: "Bad clan Id" }, { status: 400, statusText: "Can't find clan" })
    const user = await findUserByUsername(username)
    if (user.clan && user.clan.joined) return NextResponse.json({ error: "Already joined another clan" }, { status: 400, statusText: "Already joined another clan" })
    await joinClan({ username, id })
    return NextResponse.json("OK", { status: 200 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
