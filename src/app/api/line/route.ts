import { signToken } from "@/controller/auth";
import { createLine, findPendingLines, updateLine } from "@/controller/bet";
import { findUserByUsername } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { getCookieResponse, JWT_SECRET } from "@/utils";
// This endpoint should be called by a cron job service
export async function POST(request: NextRequest) {
  try {
    const { question, event, league, sports, yes, no, endsAt } = await request.json()
    const result = "pending"
    const token = request.headers.get('token') || '';
    const { username, role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin" && role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const line = await createLine({ question, event, league, sports, yes, no, endsAt, result, openedBy: username })
    const lines = await findPendingLines(role)
    return NextResponse.json({ lines }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
export async function PUT(request: NextRequest) {
  try {
    const { question, event, league, sports, yes, no, endsAt, _id } = await request.json()
    const result = "pending"
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin" && role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const line = await updateLine({ question, event, league, sports, yes, no, endsAt, result, _id })
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
    if (token) {
      const { username, role }: any = jwt.verify(token, JWT_SECRET)
      const user = await findUserByUsername(username)
      const lines = await findPendingLines(role)
      const new_token = signToken(user)
      return getCookieResponse({
        response: NextResponse.json({ lines, token: new_token, basets: new Date().getTime() }, { status: 200 }),
        token: new_token
      })
    } else {
      const lines = await findPendingLines("user")
      return NextResponse.json({ lines, token: "", basets: new Date().getTime() }, { status: 200 })
    }
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
