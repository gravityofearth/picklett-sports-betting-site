import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { createWar } from "@/controller/clan";

export async function POST(request: NextRequest) {
  try {
    const { prize, stake, slots, minMembers } = await request.json()
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    await createWar({ prize, stake, slots, minMembers })
    return NextResponse.json("OK", { status: 200 })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
