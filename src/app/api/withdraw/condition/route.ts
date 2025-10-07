
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { compareDeopositVsBet } from "@/controller/withdraw";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const depositVsBet = await compareDeopositVsBet(username)
    return NextResponse.json(depositVsBet[0], { status: 200 });

  } catch (error: any) {
    console.error("Error in approve withdraw:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
} 