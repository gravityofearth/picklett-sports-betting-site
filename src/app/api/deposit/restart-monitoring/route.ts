
import { NextRequest, NextResponse } from "next/server";
import { confirmDeposit, detectDeposit, getMonitoringDeposits } from "@/controller/deposit";

export async function POST(request: NextRequest) {
  try {
    const deposits = await getMonitoringDeposits()
    deposits.forEach((d) => detectDeposit(d))
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