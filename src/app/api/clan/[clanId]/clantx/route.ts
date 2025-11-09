import { getClanTxs } from "@/controller/clan";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
    try {
        const { clanId } = await params;
        const clanTxs = await getClanTxs({ clanId })
        return NextResponse.json({ clanTxs }, { status: 200 })
    } catch (error: any) {
        console.error("Error in get clan:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
