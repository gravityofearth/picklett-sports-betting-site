import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { operateClanJoin } from "@/controller/clan";
import { findUserByUsername } from "@/controller/user";

export async function POST(request: NextRequest) {
  try {
    const { id, username, isApprove } = await request.json()
    const token = request.headers.get('token') || '';
    const { username: ownerUsername }: any = jwt.verify(token, JWT_SECRET)
    const owner = await findUserByUsername(ownerUsername)
    const checkClanOwnership = owner.clan && owner.clan.joined && owner.clan.clanId.toString() === id && ["owner", "elder"].some(role => role === owner.clan.role)
    if (!checkClanOwnership) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Unable action" })
    await operateClanJoin({ username, id, isApproved: isApprove })
    return NextResponse.json("OK", { status: 200 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
