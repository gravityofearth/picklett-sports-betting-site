
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { getAffiliates } from "@/controller/affiliate";

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('token') || '';
        const { username, role }: any = jwt.verify(token, JWT_SECRET)
        const rewards = await getAffiliates({ role, referrer: username })
        return NextResponse.json({ rewards }, { status: 200 });

    } catch (error: any) {
        console.error("Error processing commissions:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
