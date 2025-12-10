
import { getWrappedBetsByLineIds, findLines, resolveBetsforLineId, updateLinesStatus } from "@/controller/bet";
import { BetResultType, OddsType } from "@/types";
import { WEBHOOK_SECRET, RAPID_API_HEADERS } from "@/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
type ResultType = {
  events: {
    starts?: string,
    home_team_type?: string,
    periods: any,
    period_results?: {
      "number": number,
      "team_1_score": number,
      "team_2_score": number,
      "cancellation_reason": any
    }[]
  }[]
}
const resolveLines = async () => {
  const liveLines = await findLines({
    filter: { status: "live" }
  })
  const liveLineIds = liveLines.map(line => line._id.toString())
  const wrappedLiveBets: {
    lineId: string,
    bets: {
      _id: string, username: string, num: string, oddsName: string, point: string, team_total_point: number, index: number,
    }[]
  }[] = await getWrappedBetsByLineIds(liveLineIds)
  const lineIds_in_LiveBets = new Set(wrappedLiveBets.map(v => v.lineId.toString()));
  const inactiveLineIds = liveLineIds.filter(v => !lineIds_in_LiveBets.has(v));
  await updateLinesStatus({ lineIds: inactiveLineIds, status: "inactive" })
  console.log(`Marked ${inactiveLineIds.length} lines as inactive`)

  const activeLiveLines = liveLines.filter(line => lineIds_in_LiveBets.has(line._id.toString()))
  console.log(`Resolving ${activeLiveLines.length} lines`)
  for (let liveLine of activeLiveLines) {
    const start_time = performance.now()
    const { _id: lineId, eventId, sports }: { _id: string, eventId: string, sports: string } = liveLine
    try {
      const { data: { events: [event] } }: { data: ResultType } = await axios.get(`https://pinnacle-odds.p.rapidapi.com/kit/v1/details?event_id=${eventId}`, {
        headers: RAPID_API_HEADERS
      })
      if (!event.period_results) continue
      if (Object.keys(event.periods).length !== event.period_results.length) continue
      const wrappedBet = wrappedLiveBets.find(v => v.lineId.toString() === lineId.toString())
      if (!wrappedBet) continue
      const bets_onLineId = wrappedBet.bets
      const betResolver: { [username: string]: { bet: any, result: BetResultType }[] } = {}
      let status = "finished"
      for (let bet of bets_onLineId) {
        const number = Number(bet.num.replace("num_", ""))
        const period_result = event.period_results.filter(v => v.number === number)[0]
        if (!period_result) continue
        let result: BetResultType = "win"
        if (period_result.cancellation_reason) {
          console.error(`Cancellation ${lineId}: ${period_result.cancellation_reason}`)
          status = "cancelled"
          result = "cancelled"
        }
        const team_1_score = event.home_team_type === "Team1" ? period_result.team_1_score : period_result.team_2_score
        const team_2_score = event.home_team_type === "Team1" ? period_result.team_2_score : period_result.team_1_score
        if (result !== "cancelled") {
          if (bet.oddsName.includes("total")) {//totals, team_total
            const total_score = bet.oddsName === "totals" ?
              (team_1_score + team_2_score) :
              (bet.point === "home" ? team_1_score : team_2_score)
            result = total_score === bet.team_total_point ? "draw" :
              ((total_score > bet.team_total_point) === (bet.index === 0)) ? "win" : "lose"
          } else {//money_line, spreads
            const my_hdp = Number(bet.point) * ([1, -1][bet.index])
            const my_score = [team_1_score, team_2_score][bet.index]
            const op_score = [team_1_score, team_2_score][1 - bet.index]
            result = my_score + my_hdp === op_score ? "draw" :
              my_score + my_hdp > op_score ? "win" : "lose"
          }
        }
        if (!Object.keys(betResolver).includes(bet.username)) {
          betResolver[bet.username] = []
        }
        betResolver[bet.username].push({ bet, result })
      }
      await resolveBetsforLineId({ betResolver, lineId, status })
      console.log("--- Sports line Resolved! ---", status, lineId)
    } catch (error) {
      console.error("Error in sports resolution:", error)
    }
    console.log("Elapsed time:", performance.now() - start_time)
    await new Promise((res) => setTimeout(res, 500))
  }
  console.log("Autoline resolution finished!")
}
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token') || ''
    if (token !== WEBHOOK_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" })
    resolveLines()
    return NextResponse.json("OK", { status: 200 });
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}