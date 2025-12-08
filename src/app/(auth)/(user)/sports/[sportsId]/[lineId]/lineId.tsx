"use client"

import Link from "next/link"
import { BetSlipType, LineType } from "@/types"
import { formatOddsPointTitle, formatOddsValue, ODDS_TITLE, sportsData } from "@/utils"
import { Dispatch, SetStateAction, useState } from "react"
import { useBetSlip } from "../../components/sportsLayout"

export default function LineDetailPage({ line, oddstype }: { line: LineType, oddstype: "decimal" | "american" }) {
    const odds = JSON.parse(line.odds)
    const filteredOdds: {
        num: string;
        oddsName: string;
        point: string;
        description: any;
        home: string;
        away: string;
        team_total_point: any;
        v1: any;
        v2: any;
        h1: any;
        h2: any;
        leagueName: string;
        _id: string;
    }[] = []
    for (let num in odds) {
        const period = odds[num]
        for (let oddsName of ["money_line", "spreads", "totals", "team_total"]) {
            if (!period[oddsName]) continue
            const odds_point = (oddsName === "money_line") ? ({ "0": period["money_line"] }) : period[oddsName]
            for (let point in odds_point) {
                const odds_key1 = oddsName.includes("total") ? "over" : "home"
                const odds_key2 = oddsName.includes("total") ? "under" : "away"
                const filteredOdd = {
                    num, oddsName, point,
                    description: period.description,
                    home: line.home,
                    away: line.away,
                    team_total_point: odds_point[point]["points"],
                    v1: odds_point[point][odds_key1],
                    v2: odds_point[point][odds_key2],
                    h1: odds_point[point][`${odds_key1}_hash`],
                    h2: odds_point[point][`${odds_key2}_hash`],
                    leagueName: line.leagueName,
                    _id: line._id,
                }
                filteredOdds.push(filteredOdd)
            }
        }
    }
    return (
        <div className="relative w-full flex">
            <div className={`w-full px-8 max-md:px-4 pb-8 flex flex-col gap-4`}>
                <Link href="./" className="flex gap-2 items-center cursor-pointer hover:underline">
                    <svg className="w-6 h-6 fill-white"><use href="#svg-left-arrow" /></svg>
                    <span className="leading-6 max-md:leading-4 select-none">Back to Home</span>
                </Link>
                <div className="relative flex flex-col items-center justify-around py-4 px-8 max-md:px-4 w-full h-44 max-md:h-[156px] rounded-lg text-center">
                    <div className="absolute inset-0 opacity-50 -z-99 bg-[url(/noshow-hero-main.png)] bg-center bg-cover"></div>
                    <div>
                        <span className="font-bold">{sportsData.find(v => v.sports === line.sports)?.label} </span> -
                        <span className="underline italic"> {line.leagueName}</span>
                    </div>
                    <div className="flex max-md:flex-col justify-between items-center w-full text-center">
                        <span className={`font-medium w-40`}>{line.home}</span>
                        <div className="text-center max-md:text-sm">
                            {new Date(line.startsAt).toLocaleString("en-us", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                        <span className={`font-medium w-40`}>{line.away}</span>
                    </div>
                </div>
                <div className="w-full flex flex-col">
                    {filteredOdds.map((odd, i) =>
                        <OddRow key={i} initOpen={i === 0} odd={odd} sportsId={line.sports} startsAt={line.startsAt} oddstype={oddstype} />)}
                </div>
            </div>
        </div>
    )
}
const shoudMatchKeys: (keyof BetSlipType)[] = ["lineId", "num", "oddsName", "point", "team_total_point"]
export const handlerBetSlipClick = ({ betSlip, setBetSlips, setShowBetSlip }: { betSlip: BetSlipType, setBetSlips: Dispatch<SetStateAction<BetSlipType[]>>, setShowBetSlip: Dispatch<SetStateAction<boolean>> }) => {
    const filter = (v: BetSlipType) => shoudMatchKeys.every(key => v[key] === betSlip[key])
    setBetSlips(prevSlips => {
        if (prevSlips.find(v => filter(v))) {
            return prevSlips.map(v => filter(v) ? ({ ...betSlip, amount: v.amount }) : v)
        }
        return [...prevSlips, betSlip]
    })
    setShowBetSlip(true)
}
export const isInSlips = (betSlips: BetSlipType[], betSlip: BetSlipType) => {
    const filter = (v: BetSlipType) => v.index === betSlip.index && shoudMatchKeys.every(key => v[key] === betSlip[key])
    return betSlips.some(betslip => filter(betslip))
}
const OddRow = ({ initOpen, odd: { num, v1, v2, h1, h2, description, home, away, oddsName, point, team_total_point, _id, leagueName }, sportsId, startsAt, oddstype }: { initOpen: boolean, odd: { num: string; oddsName: string; point: string; description: string; home: string; away: string; team_total_point: string; v1: any; v2: any; h1: string; h2: string; _id: string; leagueName: string; }, sportsId: string, startsAt: number, oddstype: "decimal" | "american" }) => {
    const { setShowBetSlip, setBetSlips, betSlips } = useBetSlip()
    const [open, setOpen] = useState(initOpen)
    return (
        <div className="w-full p-4 rounded-lg bg-[#0E1B2F] flex flex-col gap-4 mb-2">
            <div onClick={() => setOpen(p => !p)} className="flex justify-between items-center cursor-pointer">
                <div className="flex gap-2 items-center">
                    <span className="text-sm">{ODDS_TITLE[oddsName]} - {description}</span>
                </div>
                <svg className={`w-6 h-6 ${open ? "rotate-180" : ""}`}><use href="#svg-arrow-down" /></svg>
            </div>
            {open &&
                <div className={`flex gap-2`}>
                    {[{ team: home, v: v1 }, { team: away, v: v2 }].map(({ team, v }, i) =>
                        <div key={i} className="w-full">
                            {(() => {
                                const betSlip: BetSlipType = {
                                    lineId: _id, num, oddsName, point, team_total_point, description,
                                    value: [v1, v2][i], hash: [h1, h2][i], index: i,
                                    home, away,
                                    leagueName,
                                    amount: "", sports: sportsData.find(v => v.sports === sportsId)?.label || "", startsAt
                                }
                                return (
                                    <button key={i} onClick={() => handlerBetSlipClick({ betSlip, setBetSlips, setShowBetSlip })} className={`w-full rounded-lg p-2 ${isInSlips(betSlips, betSlip) ? "bg-[#1372ff88]" : "bg-white/10"} flex flex-col gap-2 cursor-pointer text-left text-sm`}>
                                        {formatOddsPointTitle({ oddsName, team: [home, away][i], point, team_total_point, index: i })}
                                        <span className="text-sm font-bold">{formatOddsValue(v, oddstype)}</span>
                                    </button>
                                )
                            })()}
                        </div>
                    )}
                </div>
            }
        </div>
    )
}