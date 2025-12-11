"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { BetSlipType, LineType, WarType, WrappedLineType } from "@/types"
import { convertTimestamp2HumanReadablePadded, formatOddsValue, } from "@/utils"
import { useUser } from "@/store"
import Pagination from "@/components/Pagination"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LinkOrButton, SearchHighlight } from "@/components/MUIs"
import { handlerBetSlipClick, isInSlips } from "./[lineId]/lineId"
import { useBetSlip } from "../components/sportsLayout"
import HeroSection from "../components/heroSection"
import { formatOddsPointTitle, ODDS_TITLE, sportsDataAll, UNIT_TITLE } from "@/utils/line"

export default function UserPage({ params: { activeWars, winstreak, oddstype, timeOffset, lines: lines_origin, sportsId } }: {
    params: {
        activeWars: WarType[], winstreak: number, oddstype: "decimal" | "american", timeOffset: number, lines: WrappedLineType[], sportsId: string,
    },
}) {
    const { search, setSearch } = useBetSlip()
    const wrappedLines = useMemo(() => {
        const reg = /"([^"]*)"/g;
        const matches = [];
        let match;
        while ((match = reg.exec(search)) !== null) {
            matches.push(match[1].trim());
        }
        const keywords = search.trim().split(/\s+/);
        const escapedKeywords = (search.includes("\"") ? matches : keywords).map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        const pattern = escapedKeywords.join('|');
        const regex = new RegExp(pattern, 'i');
        return lines_origin.map((wL) => ({
            ...wL, data: wL.data.filter(line => [line.sports, wL.league, line.home, line.away, line.leagueName].some(text => regex.test(text)))
        })).filter(wL => wL.data.length > 0)
    }, [search])
    const { clan, lineCount } = useUser()
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const totalPages = useMemo(() => Math.ceil(wrappedLines.length / itemsPerPage), [wrappedLines, itemsPerPage])
    const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage])
    const endIndex = useMemo(() => (startIndex + itemsPerPage), [startIndex, itemsPerPage])
    const currentWrappedLines = useMemo(() => wrappedLines.slice(startIndex, endIndex), [wrappedLines, startIndex, endIndex])
    const [opens, setOpens] = useState<boolean[]>([])
    useEffect(() => {
        const os = currentWrappedLines.map(() => false)
        if (os.length > 0) os[0] = true
        setOpens(os)
    }, [currentWrappedLines])
    const scrollableDivRef = useRef<HTMLDivElement>(null);
    const goToPage = (page: number) => {
        if (page === currentPage) return
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
        scrollableDivRef.current?.parentElement?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    const timeRemains = useMemo(() => (wrappedLines
        .reduce((prev: LineType[], cur: WrappedLineType) => ([...prev, ...cur.data]), [])
        .map(line => {
            const timestampDiff = line.startsAt - Math.floor(new Date().getTime()) + timeOffset
            return {
                id: line._id,
                text: convertTimestamp2HumanReadablePadded(timestampDiff)
            }
        })),
        [wrappedLines]
    )
    return (
        <div className="relative w-full flex" ref={scrollableDivRef}>
            <div className={`w-full flex flex-col gap-4 max-md:gap-2`}>
                <HeroSection />
                <div className="w-full overflow-x-auto flex gap-1">
                    {sportsDataAll.map(({ label, sports }, i) =>
                        <SportsTab key={i} selected={sports === sportsId} href={sports} icon={`nav-${sports}`} category={label} count={lineCount.find(lc => lc.sports === sports)?.count || 0} />
                    )}
                </div>
                {winstreak > 1 &&
                    <div className="flex items-center gap-3 bg-[#FCC8002B] rounded-[14px] p-4">
                        <svg className="w-[20px] h-[19px]"><use href="#svg-star" /></svg>
                        <div>
                            <p className="font-semibold">You are on {winstreak} winstreak!</p>
                            <p className="text-sm text-[#D1D5DC]">Hit the next milestone {winstreak >= 7 ? 10 : winstreak >= 5 ? 7 : 5} winstreak, to receive your reward!</p>
                        </div>
                    </div>
                }
                {activeWars.length > 0 &&
                    <div className="flex items-center gap-3 bg-[#FCC8002B] rounded-[14px] p-4">
                        <svg className="w-8 h-8 max-md:w-6 max-md:h-6 fill-white"><use href="#svg-clan-war" /></svg>
                        <div>
                            <p className="font-semibold">You are participating in {activeWars.length} clan wars</p>
                            <div className="flex gap-2">
                                {activeWars.map((war, i) =>
                                    <Link key={i} href={`/clans/${clan?.clanId}/wars/${war._id}/feed`} className="text-sm text-[#D1D5DC] underline">View</Link>
                                )}
                            </div>
                        </div>
                    </div>
                }
                <div className="flex max-md:flex-col md:gap-2 justify-between md:items-center">
                    <div className="flex gap-2 items-center">
                        <svg className="w-8 max-md:w-6 h-8 max-md:h-6">{sportsId === "" ? <use href="#svg-nav-all-sports" /> : <use href={`#svg-nav-${sportsId?.toLowerCase()}`} />}</svg>
                        <span className="md:text-2xl">{sportsDataAll.find(v => v.sports === sportsId)?.label || "Unknown"}</span>
                        {sportsId !== "all-sports" && <span className="text-xs p-1 rounded-sm bg-white/6">{wrappedLines.length} leagues</span>}
                    </div>
                    <div className="flex items-center gap-2 pr-2">
                        <button onClick={() => setOpens(currentWrappedLines.map(() => true))} className="p-2 rounded-md bg-[#0E1B2F] cursor-pointer text-xs">Expand All</button>
                        <button onClick={() => setOpens(currentWrappedLines.map(() => false))} className="p-2 rounded-md bg-[#0E1B2F] cursor-pointer text-xs">Collapse All</button>
                    </div>
                </div>
                <div className="flex flex-col gap-3 px-2">
                    {/* <p className="text-sm text-[#99A1AF]">Enter text what you want to search:</p> */}
                    <div className="w-full flex items-center gap-2">
                        <div className="w-full flex items-center">
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                type="text" className="w-full p-2 max-md:p-1 border border-white/70 bg-[#1E2939] max-md:rounded-sm rounded-lg text-sm" placeholder={`Use double quote(") for full match`} />
                            {search && <button onClick={() => setSearch("")} className="-translate-x-[20px] cursor-pointer w-0"><svg className="w-4 h-4"><use href="#svg-close-new" /></svg></button>}
                        </div>
                    </div>
                </div>
                <div className={`flex flex-col gap-4`}>
                    {currentWrappedLines.map((wrappedLine, i) => (
                        <WrappedLine
                            onClick={() => {
                                setOpens(prev => {
                                    const v = [...prev]
                                    v[i] = !v[i]
                                    return v
                                })
                            }}
                            key={wrappedLine.league} wrappedLine={wrappedLine} timeRemains={timeRemains} open={opens[i]} search={search} sportsId={sportsId} oddstype={oddstype}
                        />
                    )
                    )}
                    {wrappedLines.length === 0 && <div className="mb-4 text-center col-span-2">Theres no lines at the moment, please go to the discord to suggest a line you would like!</div>}
                </div>
                <Pagination params={{
                    items: wrappedLines,
                    itemsPerPage,
                    startIndex,
                    endIndex,
                    currentPage,
                    totalPages,
                    goToPage
                }} />
            </div>
        </div>
    )
}
const WrappedLine = ({ wrappedLine, timeRemains, open, onClick, search, sportsId, oddstype }: { wrappedLine: WrappedLineType, timeRemains: { id: string; text: string; }[], open: boolean, onClick: () => void, search: string, sportsId: string, oddstype: "decimal" | "american" }) => {
    const pathname = usePathname()
    const { setShowBetSlip, setBetSlips, betSlips } = useBetSlip()
    return (
        <div key={wrappedLine.league} className="bg-[#0E1B2F] rounded-md p-2 flex flex-col gap-2">
            <div onClick={onClick} className="flex justify-between items-center cursor-pointer">
                <div className="flex gap-1 items-center">
                    <p className="px-2">
                        <SearchHighlight search={search} text={wrappedLine.league} />
                    </p>
                    {sportsId !== "all-sports" &&
                        <span className={`flex justify-center items-center bg-[#1475E1] min-w-5 h-5 text-center text-xs rounded-sm`}>{wrappedLine.data.length}</span>
                    }
                </div>
                <svg className={`w-6 h-6 ${open ? "rotate-180" : ""}`}><use href="#svg-arrow-down" /></svg>
            </div>
            {open &&
                <div className="flex flex-col w-full md:gap-2 pl-2">
                    {wrappedLine.data.map(({ _id, sports, leagueName, home, away, startsAt, odds: { unit, num, description, oddsName, point, v1, v2, team_total_point, h1, h2 } }) =>
                        <div key={_id} className={`flex max-xl:flex-col justify-between gap-4 md:rounded-lg max-md:border-y max-md:border-white/70 p-4 max-md:p-2 ${timeRemains.filter(v => v.id === _id)[0]?.text?.includes("ago") ? "bg-[#202828]" : "bg-white/8"}`}>
                            <div className="w-full flex flex-col gap-2">
                                <div className="w-full flex max-md:flex-col gap-2 max-md:gap-1">
                                    <div className="flex flex-col justify-center max-md:gap-2 gap-4 text-sm w-1/3 max-md:w-full">
                                        {sportsId === "all-sports" &&
                                            <div className="flex gap-2 items-center">
                                                <svg className="w-8 max-md:w-6 h-8 max-md:h-6"><use href={`#svg-nav-${sports.toLowerCase()}`} /></svg>
                                                <SearchHighlight search={search} text={sportsDataAll.find(v => v.sports === sports)?.label || "Unknown"} />
                                                <SearchHighlight search={search} text={leagueName} />
                                            </div>
                                        }
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 shrink-0 fill-white/70 stroke-white/50"><use href="#svg-clock-new" /></svg>
                                            <p className="text-sm text-white/70">
                                                {new Date(startsAt).toLocaleString("en-us", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col justify-center max-md:gap-2 gap-4 text-sm w-full">
                                            <code className="rounded-sm w-full">
                                                <SearchHighlight search={search} text={home} />
                                            </code>
                                            <code className="rounded-sm w-full">
                                                <SearchHighlight search={search} text={away} />
                                            </code>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-2/3 max-md:w-full gap-1">
                                        <span className="text-sm">
                                            {UNIT_TITLE[unit]}{ODDS_TITLE[oddsName]} - {description}
                                        </span>
                                        <div className="w-full flex gap-2 max-md:gap-1">
                                            <div className="w-full flex max-md:flex-col gap-2 max-md:gap-1">
                                                {[0, 1].map((i) =>
                                                    <div key={i} className="w-full">
                                                        {(() => {
                                                            const betSlip: BetSlipType = {
                                                                // Should match
                                                                lineId: _id, unit, num, oddsName, point, team_total_point, description,
                                                                // To submit
                                                                value: [v1, v2][i], hash: [h1, h2][i], index: i,
                                                                // Not to submit, to display
                                                                home, away,
                                                                leagueName,
                                                                amount: "", sports: sportsDataAll.find(v => v.sports === sportsId)?.label || "", startsAt
                                                            }
                                                            return (
                                                                <button onClick={() => handlerBetSlipClick({ betSlip, setBetSlips, setShowBetSlip })} className={`w-full rounded-lg max-md:rounded-sm p-2 ${isInSlips(betSlips, betSlip) ? "bg-[#1372ff88]" : "bg-white/10"} flex flex-col justify-between text-left gap-2 max-md:gap-1 cursor-pointer`}>
                                                                    <span className="flex items-center gap-2 text-sm font-medium text-white/80">
                                                                        {oddsName === "totals" ?
                                                                            formatOddsPointTitle({ oddsName, team: [home, away][i], point, team_total_point, index: i }) :
                                                                            <>
                                                                                <SearchHighlight text={
                                                                                    oddsName === "team_total" ?
                                                                                        (point === "home" ? home : away) :
                                                                                        [home, away][i]
                                                                                } search={search} />
                                                                                {oddsName !== "money_line" &&
                                                                                    <span className="bg-[#1475E1] px-1 py-0.5 rounded-sm">
                                                                                        {formatOddsPointTitle({ oddsName, team: [home, away][i], point, team_total_point, index: i })}
                                                                                    </span>
                                                                                }
                                                                            </>
                                                                        }

                                                                    </span>
                                                                    <span className="text-sm font-bold">{formatOddsValue([v1, v2][i], oddstype)}</span>
                                                                </button>
                                                            )
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            <Link href={`${pathname}/${_id}`} className="p-1 rounded-lg max-md:rounded-sm bg-white/10 flex items-center justify-center cursor-pointer">
                                                <svg className="w-6 h-6 max-md:w-4 max-md:h-4 -rotate-90"><use href="#svg-arrow-down" /></svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
        </div>
    )
}
export const SportsTab = ({ selected, icon, category, count, href }: { selected?: boolean, icon: string, category: string, count: number, href: string }) => {
    const disabled = !count || count === 0
    if (count === 0) return null
    return (
        <LinkOrButton disabled={disabled} href={href} className={`flex flex-col gap-1 items-center p-3 cursor-pointer ${disabled ? "cursor-not-allowed" : ""}`}>
            <div className={`relative px-[11px] py-[6px] rounded-[11px] ${selected ? "bg-[#1475E133]" : "bg-[#24232A]"} border border-[#1E2939B2] hover:border hover:border-[#01A3DB] ${disabled ? "hover:border-[#1E2939B2] cursor-not-allowed" : ""}`}>
                <svg className="w-10 max-md:w-6 h-10 max-md:h-6"><use href={`#svg-${icon}`} /></svg>
                {count > 0 &&
                    <div className={`absolute top-0 right-0 min-w-6 translate-x-[50%] leading-4 -translate-y-[50%] p-1 rounded-md text-sm max-md:text-xs text-center ${selected ? "bg-[#1475E1]" : "bg-[#434343]"}`}>
                        {count}
                    </div>
                }
            </div>
            <p className="max-md:hidden max-w-20">{category}</p>
        </LinkOrButton>
    )
}