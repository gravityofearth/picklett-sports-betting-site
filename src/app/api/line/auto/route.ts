
import { createLine, findPendingLines } from "@/controller/bet";
import { SportsType } from "@/types";
import { AFFILIATE_REWARD_SECRET, convertAmerican2DecimalOdds } from "@/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
type EventType = {
  eventID: string,
  sportID: string,
  leagueID: string,
  teams: {
    [K in "home" | "away"]: {
      names: {
        long: string
      }
    }
  },
  status: {
    startsAt: string
  },
  odds: {
    [K: string]: {
      marketName: string,
      sideID: string,
      bookOdds: string,
      bookSpread?: string,
      bookOverUnder?: string,

    }
  }
}
type EsportsType = {
  SportAbbr: string,
  LG: {
    BaseLGName: string,
    ParentMatch: {
      PMatchNo: number,
      PHTName: string,
      PATName: string,
      Match: {
        MatchNo: number,
        GTName: string,
        MCDate: string,
        Odds: {
          SEL: {
            Odds: number
          }[]
        }[]
      }[]
    }[]
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
  "SOCCER": "Soccer",
  "FOOTBALL": "Others",
  "BASKETBALL": "Basketball",
  "BASEBALL": "Baseball",
  "HOCKEY": "Others",
  "HANDBALL": "Others",
  "MMA": "Others"
}
const sports: { [key: string]: string[] } = {
  soccer: ["EPL", "FR_LIGUE_1", "UEFA_CHAMPIONS_LEAGUE", "BUNDESLIGA", "INTERNATIONAL_SOCCER", "IT_SERIE_A", "LA_LIGA", "MLS"],
  basketball: ["NBA", "NCAAB", "WNBA"],
  baseball: ["MLB"],
  // tennis: [],
  others: ["NCAAF", "NFL", "NHL", "EHF_EURO", "UFC"],
}
const leagueNameDict: { [K: string]: string } = {
  "EPL": "EPL",
  "FR_LIGUE_1": "Ligue 1",
  "UEFA_CHAMPIONS_LEAGUE": "UEFA Champions League",
  "BUNDESLIGA": "Bundesliga",
  "INTERNATIONAL_SOCCER": "International Soccer",
  "IT_SERIE_A": "Serie A Italy",
  "LA_LIGA": "La Liga",
  "MLS": "MLS",
  "NCAAF": "NCAAF",
  "NFL": "NFL",
  "NBA": "NBA",
  "NCAAB": "NCAAB",
  "WNBA": "WNBA",
  "MLB": "MLB",
  "NHL": "NHL",
  "EHF_EURO": "EHF European League",
  "UFC": "UFC",
}
const oddsKeyDict: { [K: string]: string } = {
  "points-home-game-ml-home": "points-away-game-ml-away",
  "points-home-game-sp-home": "points-away-game-sp-away",
  "points-all-game-ou-over": "points-all-game-ou-under",
  "points-home-game-ou-over": "points-home-game-ou-under",
  "points-away-game-ou-over": "points-away-game-ou-under",
}
const isOddBig = (oddsStr: string) => {
  const odds = Number(oddsStr)
  return (-125 <= odds && odds <= -100) || odds >= 100
}
const openLines = async () => {
  const pendingLines = await findPendingLines("user")
  for (let sport in sports) {
    const leagues = sports[sport]
    const possibleLines: PossibleLineType[] = []
    for (let league of leagues) {
      try {
        const { data: { data: events, success } }: { data: { data: EventType[], success: boolean } } =
          await axios.get(`https://api.sportsgameodds.com/v2/events/?apiKey=53579263f192838d775d28a8f06949d7&oddsPresent=true&oddID=points-home-game-ml-home,points-home-game-sp-home,points-all-game-ou-over,points-home-game-ou-over,points-away-game-ou-over&includeOpposingOdds=true&started=false&ended=false&cancelled=false&limit=30&leagueID=${league}`)
        if (success) {
          for (let event of events) {
            for (let oddsKey in oddsKeyDict) {
              const oppOddsKey = oddsKeyDict[oddsKey]
              if (!Object.keys(event.odds).includes(oddsKey)) continue
              if (!(isOddBig(event.odds[oddsKey].bookOdds) && isOddBig(event.odds[oppOddsKey].bookOdds))) continue
              const question = oddsKey === "points-home-game-ml-home" ? `${event.teams.home.names.long} To Win` :
                oddsKey === "points-home-game-sp-home" ? `${event.teams.home.names.long} Handicap ${event.odds[oddsKey].bookSpread} Match` :
                  oddsKey === "points-all-game-ou-over" ? `Over ${event.odds[oddsKey].bookOverUnder} Total Matches` :
                    oddsKey === "points-home-game-ou-over" ? `${event.teams.home.names.long} Over ${event.odds[oddsKey].bookOverUnder} To Win` :
                      // oddsKey === "points-away-game-ou-over" ? 
                      `${event.teams.away.names.long} Over ${event.odds[oddsKey].bookOverUnder} To Win`
              const line = {
                eventId: event.eventID,
                oddsId: oddsKey,
                question,
                event: `${event.teams.home.names.long} vs ${event.teams.away.names.long}`,
                league: leagueNameDict[event.leagueID],
                sports: sportDict[event.sportID] as SportsType,
                yes: convertAmerican2DecimalOdds(Number(event.odds[oddsKey].bookOdds)),
                no: convertAmerican2DecimalOdds(Number(event.odds[oppOddsKey].bookOdds)),
                endsAt: new Date(event.status.startsAt).getTime(),
                result: "pending", openedBy: "bot"
              }
              if (pendingLines.filter(v => (v.eventId === line.eventId && v.oddsId === line.oddsId)).length === 0)
                possibleLines.push(line)
            }
          }
        }
      } catch (error) {
        console.error("Error in creating sports lines", error)
      }
      await new Promise((res) => setTimeout(res, 3000))
    }
    if (possibleLines.length === 0) continue
    const index1 = Math.floor(Math.random() * possibleLines.length)
    let index2 = Math.floor(Math.random() * possibleLines.length)
    while (index1 === index2 && possibleLines.length >= 2) {
      index2 = Math.floor(Math.random() * possibleLines.length)
    }
    await createLine(possibleLines[index1])
    if (possibleLines.length >= 2) await createLine(possibleLines[index2])
  }
  console.log("Autoline sports creation finished!")

  try {
    const { data: { Sport: esports } }: { data: { Sport: EsportsType[] } } = await axios.post(`https://w2e-api.esportsmatrix.io/api/esbull/api/GetIndexMatchV2`, {
      "GameCat": 1,
      "SportBLFilter": [
        {
          "SportId": 45,
          "BaseLGIDs": [
            -99
          ]
        },
        {
          "SportId": 46,
          "BaseLGIDs": [
            -99
          ]
        },
        {
          "SportId": 47,
          "BaseLGIDs": [
            -99
          ]
        },
        {
          "SportId": 57,
          "BaseLGIDs": [
            -99
          ]
        }
      ],
      "MatchCnt": 150,
      "SortType": 1,
      "HasLive": false,
      "Token": null,
      "Language": "eng",
      "BettingChannel": 1,
      "MatchFilter": -99,
      "Timezone": "09:00:00",
      "Event": "",
      "TriggeredBy": 1,
      "TimeStamp": Math.floor(new Date().getTime() / 1000)
    })
    const possibleLines: PossibleLineType[] = []
    for (let esport of esports) {
      for (let leagueData of esport.LG) {
        if (leagueData.ParentMatch[0].Match.length === 0) continue
        const eventId = leagueData.ParentMatch[0].PMatchNo.toString()
        const oddsId = leagueData.ParentMatch[0].Match[0].MatchNo.toString()
        const question = leagueData.ParentMatch[0].Match[0].GTName
        const home = leagueData.ParentMatch[0].PHTName
        const away = leagueData.ParentMatch[0].PATName
        const event = `${home} vs ${away}`
        const league = leagueData.BaseLGName
        const sports = "Esports" as SportsType
        const yes = Math.round(leagueData.ParentMatch[0].Match[0].Odds[0].SEL[0].Odds * 100) / 100
        const no = Math.round(leagueData.ParentMatch[0].Match[0].Odds[0].SEL[1].Odds * 100) / 100
        const endsAt = new Date(leagueData.ParentMatch[0].Match[0].MCDate).getTime()
        if (!(yes >= 1.8 && no >= 1.8)) continue
        const line = {
          eventId, oddsId, question, event, league, sports, yes, no, endsAt,
          result: "pending", openedBy: "bot"
        }
        if (pendingLines.filter(v => (Number(v.eventId) === Number(line.eventId) && Number(v.oddsId) === Number(line.oddsId))).length === 0)
          possibleLines.push(line)
      }
    }
    if (possibleLines.length === 0) {
      const index1 = Math.floor(Math.random() * possibleLines.length)
      let index2 = Math.floor(Math.random() * possibleLines.length)
      while (index1 === index2 && possibleLines.length >= 2) {
        index2 = Math.floor(Math.random() * possibleLines.length)
      }
      await createLine(possibleLines[index1])
      if (possibleLines.length >= 2) await createLine(possibleLines[index2])
    }
    console.log("Autoline e-sports creation finished!")
  } catch (error) {
    console.error("Error in creating e-sports lines", error)
  }
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