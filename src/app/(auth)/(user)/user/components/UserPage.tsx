"use client"

import { useState, useEffect } from "react"
import axios, { AxiosError } from "axios"
import { LineCardUserType, LineType, SportsType } from "@/types"
import { convertDecimal2AmericanOdds, convertTimestamp2HumanReadablePadded, showToast } from "@/utils"
import { useUser } from "@/store"
import Pagination from "@/components/Pagination"
import { SideInfoCard, SportsTab } from "./cards"

export default function UserPage({ params: { balance, winstreak, oddstype, basets, lines: lines_origin } }: {
    params: { balance: number, winstreak: number, oddstype: "decimal" | "american", basets: number, lines: (LineType & LineCardUserType)[] }
}) {
    const timeOffset = new Date().getTime() - basets
    const [lines, setLines] = useState<(LineType & LineCardUserType)[]>(lines_origin)
    const { setToken } = useUser()
    const [sportsFilter, setSportsFilter] = useState<SportsType | "">("")
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const filteredLines = lines.filter(v => (sportsFilter === "" || v.sports === sportsFilter))
    const totalPages = Math.ceil(filteredLines.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentLines = filteredLines.slice(startIndex, endIndex)
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }
    const [timeRemains, setTimeRemains] = useState<{ id: string, text: string }[]>([])
    const [sendingBetRequest, setSendingBetRequest] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            const timesRemaining = lines.map(line => {
                const timestampDiff = line.endsAt - Math.floor(new Date().getTime()) + timeOffset
                return {
                    id: line._id,
                    text: convertTimestamp2HumanReadablePadded(timestampDiff)
                }
            })
            setTimeRemains(timesRemaining)
        }, 1000)
        return () => clearInterval(interval)
    }, [lines])

    const handleBet = (_id: string) => {
        const selectedLine = lines.filter(v => v._id === _id)[0];
        if (!selectedLine) return
        const timestampDiff = (selectedLine.endsAt || 0) - Math.floor(new Date().getTime())
        if (timestampDiff < 0) {
            showToast("Bet already ended", "warn")
            return
        }
        if (!selectedLine.side) {
            showToast("Select bet side", "warn")
            return
        }
        if (selectedLine.amount.trim() === "") {
            showToast("Enter amount", "warn")
            return
        }
        if ((parseFloat(selectedLine.amount) < 5 || parseFloat(selectedLine.amount) > 50)) {
            showToast("Minimum $5, Maximum $50", "warn")
            return
        }
        if (parseFloat(selectedLine.amount) > balance) {
            showToast("Invalid amount", "warn")
            return
        }
        setSendingBetRequest(true)
        const amountInNumber = parseFloat(selectedLine.amount)
        axios.post("/api/bet", {
            lineId: selectedLine._id,
            side: selectedLine.side,
            amount: amountInNumber
        }, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ status, data: { bet, token } }) => {
                if (status === 201) {
                    showToast("Successfully placed your bet", "success")
                }
                setToken(token)
                setLines(prevLines => prevLines.map(prevLineItem => prevLineItem._id === _id ? {
                    ...selectedLine,
                    amount: "",
                    side: null,
                } : prevLineItem))
            })
            .catch((e: AxiosError) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            }).finally(() => setSendingBetRequest(false))
    }
    return (
        <div className="w-full flex gap-6">
            <div className="w-full flex flex-col gap-8">
                <div className="w-full flex flex-col gap-5">
                    {/* <div className="w-full overflow-x-auto">
              <div className="min-w-[700px] grid grid-cols-3 gap-4">
                <PromoCard sport="Basketball" event="Kansas City Chiefs vs Buffalo Bills" icon="basketball" />
                <PromoCard sport="Soccer" event="Kansas City Chiefs vs Buffalo Bills" icon="soccer" />
                <PromoCard sport="Tennis" event="Kansas City Chiefs vs Buffalo Bills" icon="tennis" />
              </div>
            </div> */}
                    <div className="w-full flex flex-col gap-4 bg-linear-to-r from-[#00BFFF1A] to-[#0077FF1A] p-6 border-[#1E2939] border rounded-[14px]">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                                <svg className="w-8 h-8"><use href={`#svg-cup`} /></svg>
                                <svg className="w-8 h-8"><use href={`#svg-ranking`} /></svg>
                                <svg className="w-8 h-8"><use href={`#svg-fire`} /></svg>
                            </div>
                        </div>
                        <div className="text-2xl font-bold">Welcome to Picklett!</div>
                        <div className="font-normal leading-6 text-[#D1D5DC]">Wage small, win bigger, and receive bonus payouts on winstreaks!</div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-5">
                    <div className="w-full overflow-x-auto flex gap-2 flex-wrap">
                        <SportsTab selected={sportsFilter === ""} onClick={() => { setSportsFilter(""), goToPage(1) }} icon="all-sports" category="All Sports" count={lines.length} />
                        <SportsTab selected={sportsFilter === "Basketball"} onClick={() => { setSportsFilter("Basketball"), goToPage(1) }} icon="basketball" category="Basketball" count={lines.filter(v => v.sports === "Basketball").length} />
                        <SportsTab selected={sportsFilter === "Soccer"} onClick={() => { setSportsFilter("Soccer"), goToPage(1) }} icon="soccer" category="Soccer" count={lines.filter(v => v.sports === "Soccer").length} />
                        <SportsTab selected={sportsFilter === "Tennis"} onClick={() => { setSportsFilter("Tennis"), goToPage(1) }} icon="tennis" category="Tennis" count={lines.filter(v => v.sports === "Tennis").length} />
                        <SportsTab selected={sportsFilter === "Baseball"} onClick={() => { setSportsFilter("Baseball"), goToPage(1) }} icon="baseball" category="Baseball" count={lines.filter(v => v.sports === "Baseball").length} />
                        <SportsTab selected={sportsFilter === "Esports"} onClick={() => { setSportsFilter("Esports"), goToPage(1) }} icon="esports" category="Esports" count={lines.filter(v => v.sports === "Esports").length} />
                        <SportsTab selected={sportsFilter === "Others"} onClick={() => { setSportsFilter("Others"), goToPage(1) }} icon="others" category="Others" count={lines.filter(v => v.sports === "Others").length} />
                    </div>
                    {winstreak > 1 && <div className="flex items-center gap-3 bg-[#FCC8002B] rounded-[14px] p-4">
                        <svg className="w-[20px] h-[19px]"><use href="#svg-star" /></svg>
                        <div>
                            <p className="font-semibold">You are on {winstreak} winstreak!</p>
                            <p className="text-sm text-[#D1D5DC]">Hit the next milestone {winstreak >= 7 ? 10 : winstreak >= 5 ? 7 : 5} winstreak, to receive your reward!</p>
                        </div>
                    </div>}
                    {currentLines.map(line =>
                        <div key={line._id} className={`grid grid-cols-[auto_400px] max-md:grid-cols-1 gap-2 border border-[#1E2939] rounded-[14px] p-5 ${timeRemains.filter(v => v.id === line._id)[0]?.text?.includes("ago")?"bg-[#202828]":"bg-[#101828]"}`}>
                            <div className="flex flex-col justify-between gap-y-2 w-full">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold">{line.question}</h2>
                                    <h2 className="text-[15px] text-[#99A1AF]">{line.event} ({line.league})</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-[6px] py-[6px] px-3 bg-[#00BFFF33] rounded-full">
                                        <svg className="w-[14px] h-[14px] fill-[#01A3DB] stroke-[#01A3DB]"><use href={`#svg-${line.sports?.toLowerCase()}`} /></svg>
                                        <p className="text-[#00BFFF] text-xs">{line.sports}</p>
                                    </div>
                                    <div className="flex gap-[6px] items-center">
                                        <svg className="w-[10px] h-[12px]"><use href="#svg-clock" /></svg>
                                        <p className="text-sm font-semibold">
                                            {
                                                (() => {
                                                    const time = timeRemains.filter(v => v.id === line._id)[0]?.text
                                                    return (
                                                        <>{time?.includes("ago") ? "Ended: " : "Time Remaining: "}{time}</>
                                                    )
                                                })()
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between gap-[14px]">
                                <div className="flex justify-between gap-[14px]">
                                    <div className="w-full flex flex-col gap-1 justify-between border border-[#E5E5E566] rounded-lg py-[6px] px-3">
                                        <label htmlFor="wager" className="w-full block text-sm text-[#99A1AF]">
                                            Enter amount
                                        </label>
                                        <div className="flex items-center h-full gap-1">
                                            <span className="font-bold text-sm">$</span>
                                            <input
                                                id="wager"
                                                type="number"
                                                value={line.amount}
                                                onChange={(e) => setLines(prevLines => prevLines.map(prevLineItem => prevLineItem._id === line._id ? {
                                                    ...line,
                                                    amount: e.target.value
                                                } : prevLineItem))}
                                                className="w-full border-0 focus:outline-none font-bold text-sm"
                                                min="1"
                                                max={balance}
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-col justify-between rounded-lg py-[6px] px-3 bg-[#1E2939]">
                                        <div className="text-sm text-[#99A1AF]">Payout</div>
                                        <span className="flex items-center font-bold text-sm text-[#00BFFF]">
                                            ${(
                                                line.side === "yes" ?
                                                    ((parseFloat(line.amount) || 0) * (line.yes || 0)) :
                                                    line.side === "no" ?
                                                        (parseFloat(line.amount) || 0) * (line.no || 0) : 0
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 max-md:grid-cols-2 gap-3">
                                    <button onClick={() => setLines(prevLines => prevLines.map((prevLineItem => prevLineItem._id === line._id ? {
                                        ...line,
                                        side: "yes"
                                    } : prevLineItem)))} className={`w-full py-[14px] max-md:py-[6px] rounded-[10px] cursor-pointer hover:bg-[#00bfff4d] text-[14px] font-semibold ${line.side === "yes" ? "bg-[#00BFFF4D] text-white border border-[#00BFFF]" : "bg-[#1E2939] border border-[#1E2939]"}`}>
                                        YES {oddstype === "decimal" ? `(${line.yes})` : `(${convertDecimal2AmericanOdds(line.yes || 0)})`}
                                    </button>
                                    <button onClick={() => setLines(prevLines => prevLines.map(prevLineItem => prevLineItem._id === line._id ? {
                                        ...line,
                                        side: "no"
                                    } : prevLineItem))} className={`w-full py-[14px] max-md:py-[6px] rounded-[10px] cursor-pointer hover:bg-[#00bfff4d] text-[14px] font-semibold ${line.side === "no" ? "bg-[#00BFFF4D] text-white border border-[#00BFFF]" : "bg-[#1E2939] border border-[#1E2939]"}`}>
                                        NO {oddstype === "decimal" ? `(${line.no})` : `(${convertDecimal2AmericanOdds(line.no || 0)})`}
                                    </button>
                                    <button onClick={() => handleBet(line._id)}
                                        className="max-md:col-span-2 w-full py-[14px] max-md:py-[6px] rounded-[10px] border border-[#364153] text-white bg-[#14679F] hover:bg-[#3c85b6] text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed" disabled={sendingBetRequest}>
                                        Place Bet
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {lines.length === 0 && <div className="mb-4 text-center col-span-2">Theres no lines at the moment, please go to the discord to suggest a line you would like!</div>}
                </div>
                <Pagination params={{
                    items: filteredLines,
                    itemsPerPage,
                    startIndex,
                    endIndex,
                    currentPage,
                    totalPages,
                    goToPage
                }} />
            </div>
            <SideInfoCard winstreak={winstreak} />
        </div>
    )
}