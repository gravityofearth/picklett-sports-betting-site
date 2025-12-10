
import axios from "axios";
import { bulkLines_desctructing, findLines } from "@/controller/bet";
import { RAPID_API_HEADERS, deleteUnnecessaryKeysAndRoundOdds, getObjectDiff, sportsData } from "@/utils";
type MarketType = {
    sport_name: string;
    events: {
        event_id: number;
        league_id: number;
        league_name: string;
        starts: string;
        home: string;
        away: string;
        periods: any
    }[]
}
type SportLineType = {
    eventId: string;
    sports: string;
    leagueId: number;
    leagueName: string;
    home: string;
    away: string;
    startsAt: number;
    status: string;
    odds: string;
}

export const openSportsLines = async () => {
    while (1) {
        for (let { id: sportsId, sports: sportsSlug } of sportsData) {
            const start_time = performance.now()
            console.log(`---------------${sportsSlug}----------------`)
            try {
                const pendingLines = await findLines({ filter: { status: "pending", sports: sportsSlug } })
                const lines: SportLineType[] = []
                const { data: marketData }: { data: MarketType } = await axios.get(`https://pinnacle-odds.p.rapidapi.com/kit/v1/markets?event_type=prematch&sport_id=${sportsId}&is_have_odds=true`, {
                    headers: RAPID_API_HEADERS
                })
                for (let event of marketData.events) {
                    const { event_id, league_id, league_name, home, away, starts, periods } = event
                    deleteUnnecessaryKeysAndRoundOdds(periods)
                    const line = {
                        eventId: event_id.toString(),
                        sports: sportsSlug,
                        leagueId: league_id,
                        leagueName: league_name,
                        home,
                        away,
                        startsAt: new Date(`${starts}Z`).getTime(),
                        status: "pending",
                        odds: JSON.stringify(periods),
                    }
                    if (line.startsAt > new Date().getTime() && line.startsAt < (new Date().getTime() + 24 * 60 * 60 * 1000)) lines.push(line)
                }
                const eventIds_line = new Set(lines.map(v => v.eventId.toString()))
                const eventIds_pending_line = new Set(pendingLines.map(v => v.eventId.toString()))
                const off_pending_lines = pendingLines.filter((pl) => !eventIds_line.has(pl.eventId))
                const operations = lines.map(line => ({
                    updateOne: {
                        filter: { eventId: line.eventId },
                        update: { $set: line },
                        upsert: true,
                    }
                }))
                await bulkLines_desctructing(operations)
                console.log(`Processed: ${sportsSlug}:${lines.length} lines processed!`)
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
                const updateLineInfo: { diff: any[], new: any[] } = {
                    diff: [],
                    new: []
                }
                lines.forEach(line => {
                    if (eventIds_pending_line.has(line.eventId)) {
                        const original = pendingLines.find((v) => v.eventId === line.eventId)
                        const { normal_diff } = getObjectDiff(
                            { startsAt: original.startsAt, odds: JSON.parse(original.odds) },
                            { startsAt: line.startsAt, odds: JSON.parse(line.odds) },
                            // new Set(["line_id", "alt_line_id", "meta", "max"])
                        )
                        if (Object.keys(normal_diff).length > 0) updateLineInfo.diff.push({ eventId: line.eventId, ...normal_diff })
                    } else {
                        updateLineInfo.new.push(line)
                    }
                });
                console.log(`Updated: ${updateLineInfo.diff.length} lines, Added: ${updateLineInfo.new.length} lines`)
            } catch (error) {
                console.error(`Error in ${sportsSlug} creation:`, error)
            }
            console.log("Elapsed time:", performance.now() - start_time)
            await new Promise((res) => setTimeout(res, 60_000))
        }
        console.log("One Round Ended for opening line")
    }
}