import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { editClan } from "@/controller/clan";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  try {
    const { clanId } = await params;
    const { description, icon } = await request.json()
    const token = request.headers.get('token') || '';
    const { clan }: any = jwt.verify(token, JWT_SECRET)
    const checkClanOwnership = clan && clan.joined && clan.clanId.toString() === clanId && clan.role === "owner"
    if (!checkClanOwnership) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Unable action" })
    await editClan({ description, icon, clanId })
    return NextResponse.json("OK", { status: 200 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
