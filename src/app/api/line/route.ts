import { fetchLinesBySports } from "@/controller/bet";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { sportsDataAll } from "@/utils/line";
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const searchParams = request.nextUrl.searchParams;
    const sports = searchParams.get('sports')?.trim() || "";
    const sportsFilter = sportsDataAll.map(v => v.sports).includes(sports) ? sports : ""
    if (!sportsFilter) return NextResponse.json({ error: "Bad parameter" }, { status: 400, statusText: "Bad parameter" });
    if (token) {
      const { role }: any = jwt.verify(token, JWT_SECRET)
      const isAdmin = role === "admin"
      const lines = await fetchLinesBySports({ isAdmin, sports: sportsFilter })
      return NextResponse.json({ lines, basets: new Date().getTime() }, { status: 200 })
    } else {
      const lines = await fetchLinesBySports({ isAdmin: false, sports: sportsFilter })
      return NextResponse.json({ lines, basets: new Date().getTime() }, { status: 200 })
    }
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
