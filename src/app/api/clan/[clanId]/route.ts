import { signToken } from "@/controller/auth";
import jwt from "jsonwebtoken"
import { getCookieResponse, JWT_SECRET } from "@/utils";
import { getClanInfo, getClanRank } from "@/controller/clan";
import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername } from "@/controller/user";
import mongoose from "mongoose";

export async function GET(request: NextRequest, { params }: { params: any }) {
    try {
        const token = request.headers.get('token') || '';
        const { username }: any = jwt.verify(token, JWT_SECRET)
        const { clanId } = await params;
        const clan = (await getClanInfo({ _id: new mongoose.Types.ObjectId(clanId as string) }))[0]
        const rank = await getClanRank(clan.wins)
        const user = await findUserByUsername(username)
        const new_token = signToken(user)
        return getCookieResponse({
            response: NextResponse.json({ clan, rank, token: new_token }, { status: 200 }),
            token: new_token,
        })
    } catch (error: any) {
        console.error("Error in get clan:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
