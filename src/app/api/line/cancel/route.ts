import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
import { cancelLine } from "@/controller/bet";
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Unauthorized request" });
    await cancelLine({ id })
    return NextResponse.json("OK", { status: 200 });

  } catch (error: any) {
    console.error("Error in cancelling line:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
} 