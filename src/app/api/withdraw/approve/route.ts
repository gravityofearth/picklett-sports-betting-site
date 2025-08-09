
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { approveWithdraw } from "@/controller/withdraw";

export async function POST(request: NextRequest) {
  try {
    const { id, tx } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    if (username !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Unauthorized request" });
    const withdraw = await approveWithdraw({ id, tx })
    return NextResponse.json({ withdraw }, { status: 200 });

  } catch (error: any) {
    console.error("Error in approve withdraw:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
} 