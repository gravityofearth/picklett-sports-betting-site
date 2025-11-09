import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername } from "@/controller/user";
import { promoteClanMember } from "@/controller/clan";

export async function POST(request: NextRequest, { params }: { params: any }) {
  try {
    const { clanId } = await params;
    const { username, role } = await request.json()
    const token = request.headers.get('token') || '';
    const { clan }: any = jwt.verify(token, JWT_SECRET)
    if (clan?.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Unable action" })
    const user = await findUserByUsername(username)
    if (user?.clan?.clanId.toString() !== clanId || !user?.clan?.joined) return NextResponse.json({ error: "Bad request" }, { status: 400, statusText: "Not a member" })
    if (!["elder", "member"].includes(role)) return NextResponse.json({ error: "Bad request" }, { status: 400, statusText: "Invalid role" })
    await promoteClanMember({ username, clanId, role })
    return NextResponse.json("OK", { status: 200 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
