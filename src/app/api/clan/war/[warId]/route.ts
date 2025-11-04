
import { findWars } from "@/controller/clan";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, { params }: { params: any }) {
    try {
        const { warId } = await params;
        const war = (await findWars({ _id: new mongoose.Types.ObjectId(warId as string) }))[0]
        return NextResponse.json({ war }, { status: 200 });
    } catch (error: any) {
        console.error("Error in get war:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
