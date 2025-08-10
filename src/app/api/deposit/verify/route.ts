
import { NextRequest, NextResponse } from "next/server";
import { getDepositById, getDepositByTx, updateDeposit, verifyDeposit } from "@/controller/deposit";

export async function POST(request: NextRequest) {
  try {
    const { id, coinType, tx } = await request.json()
    if (!id || !coinType || !tx) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const deposit = await getDepositById(id)
    if (!deposit) return NextResponse.json({ error: "Could not find matching deposit information" }, { status: 400 });
    if (deposit.result !== "initiated") return NextResponse.json({ error: "Transaction is already processed" }, { status: 400 });
    if (new Date(deposit.createdAt).getTime() + 10 * 60 * 1000 < new Date().getTime()) {
      const updatedDeposit = await updateDeposit(id, coinType, tx, "failed", "Transaction sent after expiring time")
      return NextResponse.json({ deposit: updatedDeposit }, { status: 200 });
    }
    const matching_tx = await getDepositByTx(tx)
    if (matching_tx) {
      console.log(matching_tx)
      const updatedDeposit = await updateDeposit(id, coinType, tx, "failed", "Submitted transaction that is already processed by our system")
      return NextResponse.json({ deposit: updatedDeposit }, { status: 200 });
    }
    const updatedDeposit = await updateDeposit(id, coinType, tx, "verifying")
    await verifyDeposit(updatedDeposit, coinType, tx)
    return NextResponse.json({ deposit: updatedDeposit }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}