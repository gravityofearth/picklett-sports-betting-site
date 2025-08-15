import { signToken } from "@/controller/auth";
import { createLine, findPendingLines, updateLine } from "@/controller/bet";
import { findUserByUsername } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
// This endpoint should be called by a cron job service
export async function POST(request: NextRequest) {
  try {
    const { question, yes, no, endsAt } = await request.json()
    const result = "pending"
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin" && role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const line = await createLine({ question, yes, no, endsAt, result })
    const lines = await findPendingLines(role)
    return NextResponse.json({ lines }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
export async function PUT(request: NextRequest) {
  try {
    const { question, yes, no, endsAt, _id } = await request.json()
    const result = "pending"
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin" && role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const line = await updateLine({ question, yes, no, endsAt, result, _id })
    const lines = await findPendingLines(role)
    return NextResponse.json({ lines }, { status: 202 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { username, role }: any = jwt.verify(token, JWT_SECRET)
    const user = await findUserByUsername(username)
    const lines = await findPendingLines(role)
    const new_token = signToken(user)
    return NextResponse.json({ lines, token: new_token, basets: new Date().getTime() }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
