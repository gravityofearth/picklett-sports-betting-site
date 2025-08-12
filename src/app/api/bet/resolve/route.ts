import { resolveBet } from "@/controller/bet";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
// This endpoint should be called by a cron job service
export async function POST(request: NextRequest) {
  try {
    const { lineId, winningSide } = await request.json()
    if (!["yes", "no"].includes(winningSide)) return NextResponse.json({ error: "Bad winning side" }, { status: 400, statusText: "Winning Side value is not correct" });
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    if (username !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    await resolveBet(lineId, winningSide)
    return NextResponse.json("OK", { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}