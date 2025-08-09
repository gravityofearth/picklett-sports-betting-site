
import { getWithdrawById } from "@/controller/withdraw";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const { withdrawId } = await params;
    const withdraw = await getWithdrawById(withdrawId)
    return NextResponse.json({ withdraw }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}