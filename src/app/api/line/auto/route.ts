
import { createLine, findPendingLines } from "@/controller/bet";
import { SportsType } from "@/types";
import { AFFILIATE_REWARD_SECRET } from "@/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
type OddsType = "money_line" | "spreads" | "totals" | "team_total"
type MarketType = {
  sport_name: string;
  events: {
    event_id: number;
    league_name: string;
    starts: string;
    home: string;
    away: string;
    periods: {
      [K: string]: {
        line_id: number;
        description: string;
        money_line: {
          home: number;
          draw: number;
          away: number;
        } | null
        spreads: {
          [K: string]: {
            hdp: number;
            home: number;
            away: number;
          }
        } | null
        totals: {
          [K: string]: {
            points: number;
            over: number;
            under: number;
          }
        } | null
        team_total: {
          [K in "home" | "away"]: {
            points: number;
            over: number;
            under: number;
          }
        } | null
      }
    }
  }[]
}
type PossibleLineType = {
  eventId: string;
  oddsId: string;
  question: string;
  event: string;
  league: string;
  sports: SportsType;
  yes: number;
  no: number;
  endsAt: number;
  result: string;
  openedBy: string;
}
const sportDict: { [K: string]: string } = {
  "Soccer": "Soccer",
  "Tennis": "Tennis",
  "Basketball": "Basketball",
  "Baseball": "Baseball",
  "E Sports": "Esports",
  "Hockey": "Others",
  "Volleyball": "Others",
  "Handball": "Others",
  "American Football": "Others",
  "Mixed Martial Arts": "Others",
  "Cricket": "Others",
}
const openLines = async () => {
  const pendingLines = await findPendingLines("user")
  for (let sportsId of [1, 2, 3, 9, 10, 7, 8]) {
    const possibleLines: PossibleLineType[] = []
    try {
      // const timestamp = Math.floor(new Date().getTime() / 1000)
      const { data: marketData }: { data: MarketType } = await axios.get(`https://pinnacle-odds.p.rapidapi.com/kit/v1/markets?event_type=prematch&sport_id=${sportsId}&is_have_odds=true`, {
        headers: {
          "x-rapidapi-host": "pinnacle-odds.p.rapidapi.com",
          "x-rapidapi-key": "a07dd4812amsh52727a34c5d33bdp1d45d1jsna6b9deb98244"
        }
      })
      for (let event of marketData.events) {
        for (let periodKey in event.periods) {
          const period = event.periods[periodKey]
          const oddsDataDict: {
            [K in OddsType]: {
              question: (hdp_points: string) => string;
              yes: (hdp_points: string) => number;
              no: (hdp_points: string) => number;
            }
          } = {
            money_line: {
              question: () => `${event.home} To Win ${period.description}`,
              yes: () => period.money_line?.home ?? 1,
              no: () => period.money_line?.away ?? 1,
            },
            spreads: {
              question: (hdp?: string) => `${event.home} Handicap ${Number(hdp) > 0 ? "+" : ""}${hdp} ${period.description}`,
              yes: (hdp?: string) => period.spreads?.[hdp!].home ?? 1,
              no: (hdp?: string) => period.spreads?.[hdp!].away ?? 1,
            },
            totals: {
              question: (points?: string) => `Over ${points} ${period.description}`,
              yes: (points?: string) => period.totals?.[points!].over ?? 1,
              no: (points?: string) => period.totals?.[points!].under ?? 1,
            },
            team_total: {
              question: (home_away: string) => `${event[home_away as "home" | "away"]} Over ${period.team_total?.[home_away as "home" | "away"].points} ${period.description}`,
              yes: (home_away: string) => period.team_total?.[home_away as "home" | "away"].over ?? 1,
              no: (home_away: string) => period.team_total?.[home_away as "home" | "away"].under ?? 1,
            },
          }
          for (let oddsKey in oddsDataDict) {
            const typedOddsKey = oddsKey as OddsType
            const oddsData = oddsDataDict[typedOddsKey]
            for (let hdp_points in typedOddsKey === "money_line" ? { 0: period.money_line } : period[typedOddsKey]) {
              const line = {
                eventId: event.event_id.toString(),
                oddsId: `${period.line_id}-${typedOddsKey}-${hdp_points}`,
                question: oddsData.question(hdp_points),
                event: `${event.home} vs ${event.away}`,
                league: event.league_name,
                sports: sportDict[marketData.sport_name] as SportsType,
                yes: oddsData.yes(hdp_points),
                no: oddsData.no(hdp_points),
                endsAt: new Date(`${event.starts}Z`).getTime(),
                result: "pending", openedBy: "bot"
              }
              if (
                line.yes >= 1.8 && line.no >= 1.8 && line.endsAt > new Date().getTime() && line.endsAt < (new Date().getTime() + 24 * 60 * 60 * 1000) &&
                pendingLines.filter(v => (v.eventId === line.eventId && v.oddsId === line.oddsId)).length === 0
              ) {
                possibleLines.push(line)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in auto line creation:", error)
    }
    if (possibleLines.length === 0) continue
    const index1 = Math.floor(Math.random() * possibleLines.length)
    let index2 = Math.floor(Math.random() * possibleLines.length)
    while (index1 === index2 && possibleLines.length >= 2) {
      index2 = Math.floor(Math.random() * possibleLines.length)
    }
    await createLine(possibleLines[index1])
    if (possibleLines.length >= 2) await createLine(possibleLines[index2])
    await new Promise((res) => setTimeout(res, 3000))
  }
  console.log("Autoline creation finished!")
}
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token') || ''
    if (token !== AFFILIATE_REWARD_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" })
    openLines()
    return NextResponse.json("OK", { status: 200 });

  } catch (error: any) {
    console.error("Error processing commissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}