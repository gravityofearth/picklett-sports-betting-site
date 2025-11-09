import { NextRequest, NextResponse } from "next/server";
import { confirmDeposit, detectDeposit, getMonitoringDeposits } from "@/controller/deposit";
import { WEBHOOK_SECRET } from "@/utils";
import connectMongoDB from "@/utils/mongodb";

export async function POST(request: NextRequest) {
  await connectMongoDB()
  try {
    const token = request.headers.get('token') || ''
    if (token !== WEBHOOK_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" })
    const deposits = await getMonitoringDeposits()
    for (let deposit of deposits) {
      if (deposit.result === "initiated") {
        detectDeposit(deposit)
      } else if (deposit.result === "confirming") {
        confirmDeposit(deposit)
      }
    }
    return NextResponse.json("OK", { status: 200 });
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}