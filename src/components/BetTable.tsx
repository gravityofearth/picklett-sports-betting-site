"use client"

import { BetType } from "@/types"
import { useMemo, useState } from "react"
import Pagination from "./Pagination"
import { formatOddsPointTitle, ODDS_TITLE, sportsData } from "@/utils"

const BetTable = ({ userBets, username, adminPage }: { userBets: BetType[], username: string, adminPage?: boolean }) => {
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [filter, setFilter] = useState<"active" | "settled">("active")
    const activeBets = userBets.filter(v => (adminPage || v.username === username) && v.result === "pending")
    const settledBets = userBets.filter(v => (adminPage || v.username === username) && v.result !== "pending")
    const filteredUserBets = useMemo(() => filter === "active" ? activeBets : settledBets, [filter])
    const totalPages = Math.ceil(filteredUserBets.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentBets = filteredUserBets.slice(startIndex, endIndex)
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }
    return (
        <>
            <div className="flex gap-2 max-md:flex-col">
                <button onClick={() => setFilter("active")} className={`p-2 w-40 rounded-lg border cursor-pointer select-none ${filter === "active" ? "bg-[#1475E1] border-[#1475E1]" : "bg-white/10 border-white"}`}>Active Bets ({activeBets.length})</button>
                <button onClick={() => setFilter("settled")} className={`p-2 w-40 rounded-lg border cursor-pointer select-none ${filter === "settled" ? "bg-[#1475E1] border-[#1475E1]" : "bg-white/10 border-white"}`}>Settled Bets ({settledBets.length})</button>
            </div>
            <div className="p-4 rounded-3xl bg-[#0E1B2F]">
                <div className="flex flex-col gap-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white/10">
                                    {adminPage && <th className="pl-6 py-4 pr-2 text-left text-sm font-normal rounded-l-2xl">Username</th>}
                                    <th className={`${adminPage ? "px-2" : "pl-6 py-4"} py-6 text-left text-sm text-[#D1D5DC]`}>Sports</th>
                                    <th className={`${adminPage ? "px-2" : "pl-6 py-4"} py-6 text-left text-sm text-[#D1D5DC]`}>League</th>
                                    <th className="py-4 px-2 text-left text-sm font-normal">Event</th>
                                    <th className="py-4 px-2 text-left text-sm font-normal">Detail</th>
                                    <th className="py-4 px-2 text-left text-sm font-normal">Amount</th>
                                    <th className="py-4 px-2 text-left text-sm font-normal">Odds</th>
                                    <th className={`py-4 text-left text-sm font-normal ${filter === "active" ? "pl-2 py-6 pr-6 rounded-r-2xl" : "px-2"}`}>Waged Time</th>
                                    {filter === "settled" && <th className="pl-2 py-6 pr-6 text-left text-sm text-[#D1D5DC] rounded-r-2xl">Gain/Loss</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {currentBets.map((bet, i) =>
                                    <tr key={startIndex + i} className="">
                                        {(() => {
                                            const teamName = bet.oddsName === "team_total" ? (bet.point === "home" ? bet.lineData.home : bet.lineData.away) : [bet.lineData.home, bet.lineData.away][bet.index]
                                            return (
                                                <>
                                                    {adminPage && <td className="pl-6 py-1 pr-2 whitespace-nowrap text-sm">{bet.username}</td>}
                                                    <td className="py-4 px-2 text-sm">{sportsData.find(v => v.sports === bet.lineData.sports)?.label}</td>
                                                    <td className="py-4 px-2 text-sm">{bet.lineData.leagueName}</td>
                                                    <td className="py-4 px-2 text-xs">
                                                        <p className={`${bet.oddsName !== "totals" && teamName === bet.lineData.home ? "text-[#006fee]" : ""}`}>{bet.lineData.home}</p>
                                                        <p className={`${bet.oddsName !== "totals" && teamName === bet.lineData.away ? "text-[#006fee]" : ""}`}>{bet.lineData.away}</p>
                                                    </td>
                                                    <td className="py-4 px-2 text-xs">
                                                        {bet.oddsName !== "totals" && <p className="text-[#1475E1]">{teamName}</p>}
                                                        <p>{ODDS_TITLE[bet.oddsName]} - {bet.description}</p>
                                                        <p className="underline">{
                                                            formatOddsPointTitle({
                                                                oddsName: bet.oddsName,
                                                                team: [bet.lineData.home, bet.lineData.away][bet.index],
                                                                point: bet.point, team_total_point: bet.team_total_point?.toString(), index: bet.index
                                                            })
                                                        }</p>
                                                    </td>
                                                    <td className="py-4 px-2">${bet.amount.toFixed(2)}</td>
                                                    <td className="py-4 px-2">{bet.value}</td>
                                                    <td className="py-4 px-2 flex flex-col justify-center items-start text-sm">
                                                        <span>{new Date(bet.createdAt).toLocaleDateString("en-GB")}</span>
                                                        <span>{new Date(bet.createdAt).toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                                    </td>
                                                    {filter === "settled" &&
                                                        <td className={`pl-1 py-3 pr-5 font-bold ${bet.result === "win" ? "text-[#00D492]" : bet.result === "lose" ? "text-[#FF6467]" : bet.result === "draw" ? "text-[#ffc164]" : "text-[#f3463a] italic line-through"}`}>
                                                            {bet.result === "win" ? `+$${(bet.amount * (bet.value - 1)).toFixed(2)}` :
                                                                bet.result === "lose" ? `-$${bet.amount.toFixed(2)}` :
                                                                    bet.result === "draw" ? `Draw` : "Cancelled"
                                                            }
                                                        </td>}
                                                </>
                                            )
                                        })()}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination params={{
                        items: filteredUserBets,
                        itemsPerPage,
                        startIndex,
                        endIndex,
                        currentPage,
                        totalPages,
                        goToPage
                    }} />
                </div>
            </div>
        </>
    )
}
export default BetTable