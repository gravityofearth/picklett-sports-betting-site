import { findWars } from "@/controller/clan";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const clanId = searchParams.get('clanId');
        const wars = await findWars({
            $or: [
                {
                    $or: [
                        { startsAt: { $gt: Date.now() - 24 * 60 * 60 * 1000 } },
                        { startsAt: 0 }
                    ]
                },
                {
                    "clans.clanId": new mongoose.Types.ObjectId(clanId as string)
                }
            ]
        })
        return NextResponse.json({ wars }, { status: 200 });
    } catch (error: any) {
        console.error("Error in get wars:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
