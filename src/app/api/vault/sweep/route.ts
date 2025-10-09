import { sweepBTC } from "@/controller/withdraw";
import { WEBHOOK_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token') || ''
    if (token !== WEBHOOK_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" })
    sweepBTC()
    return NextResponse.json("OK", { status: 200 })
  } catch (error: any) {
    console.error("Error sweeping admin balance:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}