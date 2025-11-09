import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername } from "@/controller/user";
import { distributeClan } from "@/controller/clan";

export async function POST(request: NextRequest) {
  try {
    const { id, selectedMember, amount } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const owner = await findUserByUsername(username)
    const checkClanOwnership = owner.clan && owner.clan.joined && owner.clan.clanId.toString() === id && owner.clan.role === "owner"
    if (!checkClanOwnership) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Unable action" })
    await distributeClan({ id, selectedMember, amount })
    return NextResponse.json("OK", { status: 201 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
