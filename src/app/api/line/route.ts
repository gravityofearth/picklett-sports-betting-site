import { signToken } from "@/controller/auth";
import { fetchLinesBySports } from "@/controller/bet";
import { findUserByUsername } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { getCookieResponse, JWT_SECRET, sportsData } from "@/utils";
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const searchParams = request.nextUrl.searchParams;
    const sports = searchParams.get('sports')?.trim() || "";
    const sportsFilter = sportsData.map(v => v.sports).includes(sports) ? sports : ""
    if (token) {
      const { username, role }: any = jwt.verify(token, JWT_SECRET)
      const user = await findUserByUsername(username)
      const isAdmin = role === "admin"
      const lines = await fetchLinesBySports({ isAdmin, sports: sportsFilter })
      const new_token = signToken(user)
      return getCookieResponse({
        response: NextResponse.json({ lines, token: new_token, basets: new Date().getTime() }, { status: 200 }),
        token: new_token
      })
    } else {
      const lines = await fetchLinesBySports({ isAdmin: false, sports: sportsFilter })
      return NextResponse.json({ lines, token: "", basets: new Date().getTime() }, { status: 200 })
    }
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
