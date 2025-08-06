import { signToken } from "@/controller/auth";
import { createLine, findLine, updateLine } from "@/controller/bet";
import { createUser, findUserByUsername } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
// This endpoint should be called by a cron job service
export async function POST(request: NextRequest) {
  try {
    const { question, yes, no, endsAt, result } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    if (username !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const line = await createLine({ question, yes, no, endsAt, result })
    return NextResponse.json({ line }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
export async function PUT(request: NextRequest) {
  try {
    const { question, yes, no, endsAt, result, _id } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    if (username !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const line = await updateLine({ question, yes, no, endsAt, result, _id })
    return NextResponse.json({ line }, { status: 202 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}

export async function GET(request: NextRequest) {
  try {
    const line = await findLine()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const user = await findUserByUsername(username)
    const new_token = signToken(user)
    return NextResponse.json({ line, token: new_token }, { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
