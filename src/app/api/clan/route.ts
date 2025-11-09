import { signToken } from "@/controller/auth";
import jwt from "jsonwebtoken"
import { getCookieResponse, JWT_SECRET } from "@/utils";
import { getClanInfo } from "@/controller/clan";
import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername } from "@/controller/user";
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('token') || '';
        const { username }: any = jwt.verify(token, JWT_SECRET)
        const clans = await getClanInfo({})
        const user = await findUserByUsername(username)
        const new_token = signToken(user)
        return getCookieResponse({
            response: NextResponse.json({ clans, token: new_token }, { status: 200 }),
            token: new_token,
        })
    } catch (error: any) {
        console.error("Error in get clans:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
