
import axios from "axios";
import { bulkLines_desctructing, findLines } from "@/controller/bet";
import { RAPID_API_HEADERS } from "@/utils";
import { OddsUnitType } from "@/types";
import { deleteUnnecessaryKeysAndRoundOddsInPeriods, refinePeriods, sportsData } from "@/utils/line";
type MarketType = {
    sport_name: string;
    events: {
        event_id: number;
        league_id: number;
        league_name: string;
        parent_id: number | null;
        resulting_unit: string;
        starts: string;
        home: string;
        away: string;
        periods: any
    }[]
}
type PartialOddsType = Partial<{ [K in OddsUnitType]: string | null; }>
type SportLineType = {
    eventId: string;
    set: {
        sports: string;
        leagueId: number;
        leagueName?: string;
        home?: string;
        away?: string;
        startsAt: number;
        status: string;
    } & PartialOddsType;
    addToSet?: {
        children: {
            unit: string;
            eventId: string;
        }
    }
}

export const openSportsLines = async () => {
    while (1) {
        for (let { id: sportsId, sports: sportsSlug } of sportsData) {
            const start_time = performance.now()
            console.log(`---------------${sportsSlug}----------------`)
            try {
                const pendingLines = await findLines({ filter: { status: "pending", sports: sportsSlug } })
                const eventIds_pending_line = new Set(pendingLines.map(v => v.eventId.toString()))
                const lines: SportLineType[] = []
                const { data: marketData }: { data: MarketType } = await axios.get(`https://pinnacle-odds.p.rapidapi.com/kit/v1/markets?event_type=prematch&sport_id=${sportsId}&is_have_odds=true`, {
                    headers: RAPID_API_HEADERS
                })
                for (let event of marketData.events) {
                    const { event_id, parent_id, resulting_unit, league_id, league_name, home, away, starts, periods } = event
                    const startsAt = new Date(`${starts}Z`).getTime()
                    if (!(startsAt > Date.now() && startsAt < (Date.now() + 24 * 60 * 60 * 1000))) continue
                    deleteUnnecessaryKeysAndRoundOddsInPeriods(periods)
                    const refinedOdds = refinePeriods(periods)
                    const odds_resulting_unit = `odds_${resulting_unit.replaceAll(" ", "_").toLowerCase()}` as OddsUnitType
                    const odds: PartialOddsType = { [odds_resulting_unit]: refinedOdds }
                    const line: SportLineType = {
                        eventId: (parent_id || event_id).toString(),
                        set: {
                            sports: sportsSlug,
                            leagueId: league_id,
                            ...parent_id ? undefined : {
                                leagueName: league_name,
                                home,
                                away,
                            },
                            startsAt,
                            status: "pending",
                            ...odds,
                        },
                        addToSet: {
                            children: {
                                unit: odds_resulting_unit,
                                eventId: event_id.toString()
                            }
                        },
                    }
                    lines.push(line)
                }
                const operations = lines.map(line => ({
                    updateOne: {
                        filter: { eventId: line.eventId },
                        update: {
                            $set: line.set,
                            ...(line.addToSet ? { $addToSet: line.addToSet } : undefined),
                        },
                        upsert: true,
                    }
                }))
                await bulkLines_desctructing(operations)
                console.log(`Processed: ${sportsSlug}:${lines.length} lines processed!`)
                const eventIds_line = new Set(lines.map(v => v.eventId.toString()))
                const off_pending_lines = pendingLines.filter((pl) => !eventIds_line.has(pl.eventId))
                if (off_pending_lines.length > 0) {
                    const operations = off_pending_lines.map(opl => ({
                        updateOne: {
                            filter: { eventId: opl.eventId },
                            update: { $set: { status: "live" } },
                        }
                    }))
                    await bulkLines_desctructing(operations)
                    console.log(`Migrated to live: ${off_pending_lines.length} lines`)
                }
                const added_lines = lines.filter(line => !line.addToSet && !eventIds_pending_line.has(line.eventId)).length;
                console.log(`Bundled as: ${added_lines} lines`)
            } catch (error) {
                console.error(`Error in ${sportsSlug} creation:`, error)
            }
            console.log("Elapsed time:", performance.now() - start_time)
            await new Promise((res) => setTimeout(res, 60_000))
        }
        console.log("One Round Ended for opening line")
    }
}