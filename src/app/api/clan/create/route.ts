import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { createClan } from "@/controller/clan";

export async function POST(request: NextRequest) {
  try {
    const { title, description, icon } = await request.json()
    const token = request.headers.get('token') || '';
    const { username: ownerUserName, clan }: any = jwt.verify(token, JWT_SECRET)
    if (clan?.joined) return NextResponse.json({ error: "You are in a clan now" }, { status: 400, statusText: "You are in a clan now" })
    await createClan({ title, description, icon, ownerUserName })
    return NextResponse.json("OK", { status: 201 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
