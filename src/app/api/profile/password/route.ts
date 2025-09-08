import { updatePassword } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    await updatePassword({ username, currentPassword, newPassword })
    return NextResponse.json("OK", { status: 200 });
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}