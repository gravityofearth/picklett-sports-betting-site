import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { createRedemption, findRedemptions } from "@/controller/redemption";
export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()
    if (!amount || Number(amount) === 0) return NextResponse.json({ error: "Bad Request" }, { status: 400, statusText: "Bad Request" });
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const redemption = await createRedemption(amount)
    return NextResponse.json({ redemption }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const redemptions = await findRedemptions()
    return NextResponse.json({ redemptions }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
