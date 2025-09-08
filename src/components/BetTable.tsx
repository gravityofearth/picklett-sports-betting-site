"use client"

import { BetType } from "@/types"
import { useState } from "react"
import Pagination from "./Pagination"

const BetTable = ({ userBets, username, adminPage }: { userBets: BetType[], username: string, adminPage?: boolean }) => {
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const filteredUserBets = userBets.filter(v => adminPage || v.username === username)
    const totalPages = Math.ceil(filteredUserBets.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentBets = filteredUserBets.slice(startIndex, endIndex)
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }
    return (
        <div className="flex flex-col gap-6 pt-6 bg-linear-0 from-[#0F172B80] to-[#1D293D4D] border border-[#36415380] rounded-2xl">
            <div className="px-6 flex flex-col gap-2">
                <h2 className="text-2xl">Bet History</h2>
                <p className="text-[#99A1AF]">Lifetime all betting history</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-y border-[#36415380] bg-[#1E29394D]">
                            {adminPage && <th className="pl-6 py-6 pr-2 text-left text-sm text-[#D1D5DC]">Username</th>}
                            <th className={`${adminPage ? "px-2" : "pl-6 pr-2"} py-6 text-left text-sm text-[#D1D5DC]`}>Question</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Bet Amount</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Bet Side</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Status</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Bet Time</th>
                            <th className="pl-2 py-6 pr-6 text-left text-sm text-[#D1D5DC]">Gain/Loss</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBets.map((bet, i) => (
                            <tr key={startIndex + i} className="">
                                {adminPage && <td className="pl-6 py-6 pr-2 whitespace-nowrap">{bet.username}</td>}
                                <td className={`${adminPage ? "px-2" : "pl-6 pr-2"} py-6 text-sm`}>[{bet.question}] {bet.lineData.event} ({bet.lineData.league} - {bet.lineData.sports})</td>
                                <td className="py-6 px-2">${bet.amount.toFixed(2)}</td>
                                <td className="py-6 px-2">{bet.side}</td>
                                <td className="py-6 px-2">
                                    <div className="flex gap-1 items-center">
                                        {<svg className="w-5 h-5">
                                            <use href={`#svg-${bet.status === "win" ? "redeem" : bet.status === "lose" ? "failed" : "pending"}`} />
                                        </svg>}
                                        <span className="text-sm">{bet.status}</span>
                                    </div>
                                </td>
                                <td className="py-6 px-2 flex flex-col justify-center items-start text-sm">
                                    <span>{new Date(bet.createdAt).toLocaleDateString("en-GB")}</span>
                                    <span>{new Date(bet.createdAt).toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                </td>
                                <td className={`pl-2 py-6 pr-6 ${bet.status === "win" ? "text-[#00D492]" : bet.status === "lose" ? "text-[#FF6467]" : ""}`}>
                                    {bet.status === "win" ? `+$${(bet.amount * (bet.lineData[bet.side] - 1)).toFixed(2)}` : bet.status === "lose" ? `-$${bet.amount.toFixed(2)}` : ""}
                                </td>
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
    )
}
export default BetTable