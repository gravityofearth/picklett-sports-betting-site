"use client"

import { BetType } from "@/types"
import { useMemo, useState } from "react"
import Pagination from "./Pagination"

const BetTable = ({ userBets, username, adminPage }: { userBets: BetType[], username: string, adminPage?: boolean }) => {
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [filter, setFilter] = useState<"active" | "settled">("active")
    const activeBets = userBets.filter(v => (adminPage || v.username === username) && v.status === "pending")
    const settledBets = userBets.filter(v => (adminPage || v.username === username) && v.status !== "pending")
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
                                    <th className={`${adminPage ? "px-2" : "pl-6 py-4"} py-6 text-left text-sm text-[#D1D5DC]`}>Event</th>
                                    <th className={`${adminPage ? "px-2" : "pl-6 py-4"} py-6 text-left text-sm text-[#D1D5DC]`}>Question</th>
                                    <th className="py-4 px-2 text-left text-sm font-normal">Bet Amount</th>
                                    <th className="py-4 px-2 text-left text-sm font-normal">Bet Side</th>
                                    <th className="py-4 px-2 text-left text-sm font-normal">Odds</th>
                                    <th className={`py-4 text-left text-sm font-normal ${filter === "active" ? "pl-2 py-6 pr-6 rounded-r-2xl" : "px-2"}`}>Waged Time</th>
                                    {filter === "settled" && <th className="pl-2 py-6 pr-6 text-left text-sm text-[#D1D5DC] rounded-r-2xl">Gain/Loss</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {currentBets.map((bet, i) => (
                                    <tr key={startIndex + i} className="">
                                        {adminPage && <td className="pl-6 py-1 pr-2 whitespace-nowrap text-sm">{bet.username}</td>}
                                        <td className={`${adminPage ? "px-2" : "pl-6 pr-2"} py-4 flex flex-col justify-center items-start text-sm`}>
                                            <span className="text-xs">{bet.lineData.event}</span>
                                            <span className="text-sm">{bet.lineData.league} - {bet.lineData.sports}</span>
                                        </td>
                                        <td className={`${adminPage ? "px-2" : "pl-6 pr-2"} py-4`}>{bet.question}</td>
                                        <td className="py-4 px-2">${bet.amount.toFixed(2)}</td>
                                        <td className="py-4 px-2">{bet.side}</td>
                                        <td className="py-4 px-2">{bet.lineData[bet.side].toFixed(2)}</td>
                                        <td className="py-2 px-2 flex flex-col justify-center items-start text-sm">
                                            <span>{new Date(bet.createdAt).toLocaleDateString("en-GB")}</span>
                                            <span>{new Date(bet.createdAt).toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                        </td>
                                        {filter === "settled" &&
                                            <td className={`pl-1 py-3 pr-5 font-bold ${bet.status === "win" ? "text-[#00D492]" : bet.status === "lose" ? "text-[#FF6467]" : ""}`}>
                                                {bet.status === "win" ? `+$${(bet.amount * (bet.lineData[bet.side] - 1)).toFixed(2)}` : bet.status === "lose" ? `-$${bet.amount.toFixed(2)}` : ""}
                                            </td>}
                                    </tr>
                                ))}
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