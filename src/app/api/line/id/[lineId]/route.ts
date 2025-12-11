import { findLineById } from "@/controller/bet";
import { signLineOdds } from "@/utils/line";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const { lineId } = await params;
    const line = await findLineById(lineId)
    signLineOdds(line)
    return NextResponse.json({ line }, { status: 200 });
  } catch (error: any) {
    console.error("Error getting line by id:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}