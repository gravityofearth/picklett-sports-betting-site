import jwt from "jsonwebtoken"
import { getWithdrawById } from "@/controller/withdraw";
import { NextRequest, NextResponse } from "next/server";
import { JWT_SECRET } from "@/utils";
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const { withdrawId } = await params;
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Unauthorized request" });
    const withdraw = await getWithdrawById(withdrawId)
    return NextResponse.json({ withdraw }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}