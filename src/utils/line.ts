import crypto from 'crypto';
import { JWT_SECRET } from '.';

export const ODDS_TITLE: { [K: string]: string } = { "money_line": "To Win", "spreads": "Handicap", "totals": "Total", "team_total": "Team Total" }
export const UNIT_TITLE: { [K: string]: string } = {
    "odds_regular": "",
    "odds_sets": "",
    "odds_corners": "Corners - ",
    "odds_games": "Games - ",
    "odds_points": "Points - ",
    "odds_bookings": "Bookings - ",
    "odds_daily_total": "Daily Total - "
}
export const formatOddsPointTitle = ({ team_total_point, point, index, oddsName, team }: { team_total_point: string, point: string, index: number, oddsName: string, team: string }) => {
    if (oddsName === "money_line") return ""
    const _val = oddsName === "team_total" ? team_total_point : point
    const val = `${_val}${_val.includes(".") ? "" : ".0"}`
    const prefix = oddsName === "team_total" ? `${team} ` : ""
    if (oddsName === "spreads") {
        const num = Number(val) * ([1, -1][index])
        if (num === 0) return ["+0.0", "-0.0"][index]
        return `${prefix}${num > 0 ? "+" : "-"}${val.replace("-", "")}`
    } else {
        return `${prefix}${["Over", "Under"][index]} ${val}`
    }
}
export const sportsData: { id: number; label: string; sports: string; }[] = [
    { id: 1, label: "Soccer", sports: "soccer" },
    { id: 2, label: "Tennis", sports: "tennis" },
    { id: 3, label: "Basketball", sports: "basketball" },
    { id: 4, label: "Hockey", sports: "hockey" },
    { id: 5, label: "Volleyball", sports: "volleyball" },
    { id: 6, label: "Handball", sports: "handball" },
    { id: 7, label: "American Football", sports: "american-football" },
    { id: 8, label: "MMA", sports: "mixed-martial-arts" },
    { id: 9, label: "Baseball", sports: "baseball" },
    { id: 10, label: "E-sports", sports: "e-sports" },
    { id: 11, label: "Cricket", sports: "cricket" },
]
export const sportsDataAll = [{ id: 0, label: "All Sports", sports: "all-sports" }, ...sportsData]
const signHmac = (value: string) => {
    const hmac = crypto.createHmac('sha256', JWT_SECRET).update(value).digest('hex');
    return hmac.substring(0, 6)
}
export const signOdd = ({ unit, eventId, period_num, oddsName, point, ou_ha, value }: { unit: string, eventId: string, period_num: string, oddsName: string, point: string, ou_ha: string, value: string }) => {
    return signHmac(`${unit}-${eventId}-${period_num}-${oddsName}-${point}-${ou_ha}-${value}`)
}
type Primitive = string | number | boolean | null | undefined;
type DiffResult = { [key: string]: DiffResult | { before: any, after: any } };
export function getObjectDiff<T extends Record<string, any>>(
    obj1: T,
    obj2: T,
    ignoredKeys: Set<string> = new Set()
) {
    const detailed_diff: DiffResult = {};
    const normal_diff: DiffResult = {};
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    allKeys.forEach(key => {
        // Skip keys marked to be ignored
        if (ignoredKeys.has(key)) {
            return;
        }

        const val1 = obj1[key];
        const val2 = obj2[key];
        const areObjects = typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null;

        if (areObjects) {
            // Recursive call for nested objects
            const { detailed_diff: nested_detailed_diff, normal_diff: nested_normal_diff } = getObjectDiff(val1, val2, ignoredKeys);
            if (Object.keys(nested_detailed_diff).length > 0) {
                detailed_diff[key] = nested_detailed_diff;
                normal_diff[key] = nested_normal_diff
            }
        } else if (val1 !== val2) {
            // Record the difference for primitive types or references
            detailed_diff[key] = {
                before: val1,
                after: val2
            };
            normal_diff[key] = val2
        }
    });

    return { detailed_diff, normal_diff };
}
export function deleteUnnecessaryKeysAndRoundOddsInPeriods(obj: any) {
    const unnecessaryKeys = ["line_id", "meta", "alt_line_id", "max", "number", "cutoff", "period_status"]
    const oddsValKeys = ["home", "away", "over", "under"]
    if (typeof obj !== "object" || obj === null) return
    Object.keys(obj).forEach(key => {
        if (unnecessaryKeys.includes(key)) {
            delete obj[key]
        }
        if (oddsValKeys.includes(key)) {
            obj[key] = Math.floor(obj[key] * 100) / 100
        }
    })
    Object.keys(obj).forEach(key => deleteUnnecessaryKeysAndRoundOddsInPeriods(obj[key]))
}
export function refinePeriods(odds: any) {
    for (let num in odds) {
        const period = odds[num]
        for (let oddsName of ["money_line", "spreads", "totals", "team_total"]) {
            if (!period[oddsName]) {
                delete period[oddsName]
                continue
            }
            if (oddsName === "money_line") {
                if (period[oddsName]["draw"] || period[oddsName]["home"] < 1.8 || period[oddsName]["away"] < 1.8) delete period[oddsName]
            } else {
                for (let point in period[oddsName]) {
                    if (!period[oddsName][point]) {
                        delete period[oddsName][point]
                        continue
                    }
                    const odds_key1 = oddsName.includes("total") ? "over" : "home"
                    const odds_key2 = oddsName.includes("total") ? "under" : "away"
                    if (point.endsWith(".25") || point.endsWith(".75") || period[oddsName][point][odds_key1] < 1.8 || period[oddsName][point][odds_key2] < 1.8) delete period[oddsName][point]
                }
                if (Object.keys(period[oddsName]).length === 0) delete period[oddsName]
            }
        }
        if (Object.keys(period).length <= 1) delete odds[num]
    }
    if (Object.keys(odds).length === 0) return null
    return JSON.stringify(odds)
}
export function signLineOdds(line: any) {
    const eventId = line.eventId
    const odds = line.odds
    for (let unit in odds) {
        odds[unit] = JSON.parse(odds[unit])
    }
    for (let unit in odds) {
        const odds_unit = odds[unit]
        if (!odds_unit) {
            delete odds[unit]
            continue
        }
        for (let num in odds_unit) {
            const period_odds = odds_unit[num]
            const oddsNames = ["money_line", "spreads", "totals", "team_total"]
            for (let oddsName of oddsNames) {
                if (oddsName === "money_line") {
                    const oddsContent = period_odds[oddsName];
                    if (!oddsContent) continue
                    ["home", "away"].forEach(ha => {
                        if (Object.keys(oddsContent).includes(ha)) {
                            oddsContent[`${ha}_hash`] = signOdd({ unit, eventId, period_num: num, oddsName, point: "0", ou_ha: ha, value: oddsContent[ha] })
                        }
                    })
                } else {
                    for (let point in period_odds[oddsName]) {
                        const oddsContent = period_odds[oddsName][point]
                        if (!oddsContent) continue
                        const odds_keys = oddsName.includes("total") ? ["over", "under"] : ["home", "away"];
                        odds_keys.forEach(ou_ha => {
                            if (Object.keys(oddsContent).includes(ou_ha)) {
                                oddsContent[`${ou_ha}_hash`] = signOdd({ unit, eventId, period_num: num, oddsName, point, ou_ha, value: oddsContent[ou_ha] })
                            }
                        })
                    }
                }
            }
        }
    }
    line.odds = JSON.stringify(odds)
}
export function extractTypicalOdds(line: any) {
    const eventId = line.eventId
    const odds = line.odds
    for (let unit in odds) {
        odds[unit] = JSON.parse(odds[unit])
    }
    for (let unit in odds) {
        const odds_unit = odds[unit]
        if (!odds_unit) continue
        for (let num in odds_unit) {
            const period_odds = odds_unit[num]
            const description = period_odds["description"]
            const oddsNames = ["money_line", "spreads", "totals", "team_total"]
            for (let oddsName of oddsNames) {
                if (oddsName === "money_line") {
                    const oddsContent = period_odds[oddsName];
                    if (!oddsContent) continue
                    const v1 = oddsContent["home"]
                    const v2 = oddsContent["away"]
                    const draw = oddsContent["draw"]
                    if (!draw && v1 >= 1.8 && v2 >= 1.8) {
                        const h1 = signOdd({ unit, eventId, period_num: num, oddsName, point: "0", ou_ha: "home", value: v1 })
                        const h2 = signOdd({ unit, eventId, period_num: num, oddsName, point: "0", ou_ha: "away", value: v2 })
                        line.odds = JSON.stringify({
                            unit, num, description, oddsName, point: "0", v1, v2,
                            h1, h2
                        })
                        return
                    }
                } else {
                    for (let point in period_odds[oddsName]) {
                        if (point.endsWith(".25") || point.endsWith(".75")) continue
                        const oddsContent = period_odds[oddsName][point]
                        if (!oddsContent) continue
                        const odds_key1 = oddsName.includes("total") ? "over" : "home"
                        const odds_key2 = oddsName.includes("total") ? "under" : "away"
                        const v1 = oddsContent[odds_key1]
                        const v2 = oddsContent[odds_key2]
                        const team_total_point = oddsContent["points"]
                        if (oddsName === "team_total" && (team_total_point.toString().endsWith(".25") || team_total_point.toString().endsWith(".75"))) continue
                        if (v1 >= 1.8 && v2 >= 1.8) {
                            const h1 = signOdd({ unit, eventId, period_num: num, oddsName, point, ou_ha: odds_key1, value: v1 })
                            const h2 = signOdd({ unit, eventId, period_num: num, oddsName, point, ou_ha: odds_key2, value: v2 })
                            line.odds = JSON.stringify({
                                unit, num, description, oddsName, point, v1, v2, team_total_point,
                                h1, h2
                            })
                            return
                        }
                    }
                }
            }
        }
    }
    line.odds = ""
}