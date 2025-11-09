
import { getWarFeeds } from "@/controller/clan";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, { params }: { params: any }) {
    try {
        const { warId } = await params;
        const { userInfo, betInfo, lineInfo } = await getWarFeeds(warId)
        const feeds = betInfo.map((bet: any) => {
            const { username, lineId, amount, status, createdAt } = bet
            const avatar = userInfo.find((user: any) => user.username === username).avatar
            const event = lineInfo.find((line: any) => line._id.toString() === lineId.toString()).event
            return { username, avatar, event, amount, status, createdAt }
        })
        return NextResponse.json({ feeds }, { status: 200 });
    } catch (error: any) {
        console.error("Error in get war feeds:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
