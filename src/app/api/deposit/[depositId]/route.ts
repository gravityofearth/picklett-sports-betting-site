
import { NextRequest, NextResponse } from "next/server";
import { getDepositById } from "@/controller/deposit";
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const { depositId } = await params;
    const deposit = await getDepositById(depositId)
    return NextResponse.json({ deposit, basets: new Date().getTime() }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}