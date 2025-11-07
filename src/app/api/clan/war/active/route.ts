import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { findWars } from "@/controller/clan";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('token') || '';
        const { clan }: any = jwt.verify(token, JWT_SECRET)

        const wars = clan?.joined ?
            await findWars({
                startsAt: {
                    $gt: new Date().getTime() - 24 * 60 * 60 * 1000,
                    $lt: new Date().getTime()
                },
                "clans.clanId": new mongoose.Types.ObjectId(clan.clanId as string)
            }) :
            []
        return NextResponse.json({ wars }, { status: 200 });
    } catch (error: any) {
        console.error("Error in get active wars:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
