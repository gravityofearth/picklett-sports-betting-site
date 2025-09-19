
import { findEndedLinesOpenedByBot, resolveBet } from "@/controller/bet";
import { OddsType } from "@/types";
import { AFFILIATE_REWARD_SECRET, RAPID_API_HEADERS } from "@/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
type EventsType = {
  events: {
    period_results?: {
      "number": number,
      "team_1_score": number,
      "team_2_score": number,
    }[]
  }[]
}
const resolveLines = async () => {
  const endedLines = await findEndedLinesOpenedByBot()
  for (let endedLine of endedLines) {
    const { _id, eventId, oddsId }: { _id: string, eventId: number, oddsId: string } = endedLine
    const { number, oddsKey, hdp_points, points }: { number: number, oddsKey: OddsType, hdp_points: string, points: number } = JSON.parse(oddsId)
    try {
      const { data: { events: [event] } }: { data: EventsType } = await axios.get(`https://pinnacle-odds.p.rapidapi.com/kit/v1/details?event_id=${eventId}`, {
        headers: RAPID_API_HEADERS
      })
      if (event?.period_results) {
        const period_result = event.period_results.filter(v => v.number === number)[0]
        if (period_result) {
          const result =
            oddsKey === "money_line" ? period_result.team_1_score > period_result.team_2_score :
              oddsKey === "spreads" ? period_result.team_1_score + Number(hdp_points) > period_result.team_2_score :
                oddsKey === "totals" ? period_result.team_1_score + period_result.team_2_score > Number(hdp_points) :
                  period_result[hdp_points === "home" ? "team_1_score" : "team_2_score"] > points
          await resolveBet(_id, result ? "yes" : "no")
          console.log("--- Line Resolved! ---", _id, result)
        }
      }
    } catch (error) {
      console.error("Error in auto line resolution:", error)
    }
    await new Promise((res) => setTimeout(res, 3000))
  }
  console.log("Autoline resolution finished!")
}
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token') || ''
    if (token !== AFFILIATE_REWARD_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" })
    resolveLines()
    return NextResponse.json("OK", { status: 200 });
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}