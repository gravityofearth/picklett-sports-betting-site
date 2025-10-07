
import { findEndedLinesOpenedByBot, resolveBet, updateLineEndsAt } from "@/controller/bet";
import { OddsType } from "@/types";
import { WEBHOOK_SECRET, RAPID_API_HEADERS } from "@/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
type EventsType = {
  events: {
    starts?: string,
    home_team_type?: string,
    period_results?: {
      "number": number,
      "team_1_score": number,
      "team_2_score": number,
    }[]
  }[]
}
type EsportsEventType = {
  Data: {
    Games: {
      GameOrder: number,
      OddsResults: {
        Key: string,
        Value: number,
      }[]
    }[],
    TeamList: {
      Id: number,
      Code: string,
    }[]
  }[]
}
const resolveLines = async () => {
  const endedLines = await findEndedLinesOpenedByBot()
  const { data: { Data: leagueIdDataList } }: { data: { Data: { Id: number, Name: string }[] } } = await axios.get(`https://www.esportstatspro.com/en-US/matrix/Home/GetLeagues?timezone=0&date=`)
  for (let endedLine of endedLines) {
    const { _id, eventId, oddsId, sports, league, endsAt }: { _id: string, eventId: number, oddsId: string, sports: string, league: string, endsAt: number } = endedLine
    if (sports !== "Esports") {
      const { number, oddsKey, hdp_points, points }: { number: number, oddsKey: OddsType, hdp_points: string, points: number } = JSON.parse(oddsId)
      try {
        const { data: { events: [event] } }: { data: EventsType } = await axios.get(`https://pinnacle-odds.p.rapidapi.com/kit/v1/details?event_id=${eventId}`, {
          headers: RAPID_API_HEADERS
        })
        if (event?.period_results) {
          const period_result = event.period_results.filter(v => v.number === number)[0]
          if (period_result) {
            const team_1_score = event.home_team_type === "Team1" ? period_result.team_1_score : period_result.team_2_score
            const team_2_score = event.home_team_type === "Team1" ? period_result.team_2_score : period_result.team_1_score
            const result =
              oddsKey === "money_line" ? team_1_score > team_2_score :
                oddsKey === "spreads" ? team_1_score + Number(hdp_points) > team_2_score :
                  oddsKey === "totals" ? team_1_score + team_2_score > Number(hdp_points) :
                    hdp_points === "home" ? team_1_score : team_2_score > points
            await resolveBet(_id, result ? "yes" : "no")
            console.log("--- Sports line Resolved! ---", _id, result ? "yes" : "no")
          }
        } else if (event?.starts && new Date(`${event.starts}Z`).getTime() !== endsAt) {
          await updateLineEndsAt({ _id, endsAt: new Date(`${event.starts}Z`).getTime() })
        }
      } catch (error) {
        console.error("Error in sports resolution:", error)
      }
    } else {
      const { GameOrder, GTCode, home, away, StartTime }: { GameOrder: number, GTCode: string, home: string, away: string, StartTime: string } = JSON.parse(oddsId)
      const leagueId = leagueIdDataList.filter(v => v.Name === league)?.[0]?.Id
      if (!leagueId) continue
      try {
        const { data: { Data: events } }: { data: EsportsEventType } = await axios.get(`https://www.esportstatspro.com/en-US/matrix/Home/FetchOddsResults?pageIndex=1&timezone=0&date=${StartTime}&leagueId=${leagueId}`)
        const matchingEvent = events.filter(event => [home, away].every(teamAbbr => event.TeamList.map(v => v.Code).includes(teamAbbr)))?.[0]
        if (matchingEvent) {
          const result = matchingEvent.Games?.filter(v => v.GameOrder === GameOrder)?.[0]?.OddsResults?.filter(v => v.Key === GTCode)?.[0]
          if (result) {
            const homeId = matchingEvent.TeamList.filter(v => v.Code === home)[0].Id
            await resolveBet(_id, result.Value === homeId ? "yes" : "no")
            console.log("--- E-sports Line Resolved! ---", _id, result.Value === homeId ? "yes" : "no")
          }
        }
      } catch (error) {
        console.error("Error in esports resolution:", error)
      }
    }
    await new Promise((res) => setTimeout(res, 3000))
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