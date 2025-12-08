import { getLineCountBySports } from "@/controller/bet";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    let role = ""
    try {
      if (token) {
        const { role: _role }: any = jwt.verify(token, JWT_SECRET)
        role = _role
      }
    } finally {
      const lineCount = await getLineCountBySports(role === "admin")
      return NextResponse.json(lineCount, { status: 200 })
    }
  } catch (error: any) {
    console.error("Error getting line count:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
