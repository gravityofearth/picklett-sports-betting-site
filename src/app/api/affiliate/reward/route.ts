import { distributeAffiliateRewards, getDeservedReferrers } from "@/controller/affiliate";
import { WEBHOOK_SECRET } from "@/utils";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('token') || ''
        if (token !== WEBHOOK_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" })
        const { startsAt, endsAt } = getTimestampPeriod()
        const data = await distributeAffiliateRewards({ startsAt, endsAt })
        return NextResponse.json(data, { status: 200 })
    } catch (error: any) {
        console.error("Error distributing rewards:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}

const getTimestampPeriod = () => {
    let year = new Date().getFullYear()
    let month = new Date().getMonth()
    const date = new Date().getDate()
    let start_date = date > 25 ? 21 : date > 20 ? 16 : date > 15 ? 11 : date > 10 ? 6 : date > 5 ? 1 : 26
    let end_date = date > 25 ? 26 : date > 20 ? 21 : date > 15 ? 16 : date > 10 ? 11 : date > 5 ? 6 : 1
    const endsAt = Date.UTC(year, month, end_date, 0, 0, 0)
    // const endsAt = new Date(`${year}-${month + 1}-${end_date} 00:00:00`).getTime()
    if (start_date === 26) {
        month--
        if (month === -1) {
            month = 11
            year--
        }
    }
    const startsAt = Date.UTC(year, month, start_date, 0, 0, 0)
    // const startsAt = new Date(`${year}-${month + 1}-${start_date} 00:00:00`).getTime()
    return { startsAt, endsAt }
}