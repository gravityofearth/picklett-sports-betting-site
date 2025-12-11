import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { findWars } from "@/controller/clan";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('token') || '';
        const { username, clan }: any = jwt.verify(token, JWT_SECRET)

        const wars = clan?.joined ?
            await findWars({
                startsAt: {
                    $gt: Date.now() - 24 * 60 * 60 * 1000,
                    $lt: Date.now()
                },
                "clans.clanId": new mongoose.Types.ObjectId(clan.clanId as string),
                "clans.members": username,
            }) :
            []
        return NextResponse.json({ wars }, { status: 200 });
    } catch (error: any) {
        console.error("Error in get active wars:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
