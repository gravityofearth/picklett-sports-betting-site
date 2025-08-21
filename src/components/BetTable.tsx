"use client"

import { BetType } from "@/types"
import { useState } from "react"
import Pagination from "./Pagination"

const BetTable = ({ userBets, username, adminPage }: { userBets: BetType[], username: string, adminPage?: boolean }) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const filteredUserBets = userBets.filter(v => adminPage || v.username === username)
    // Pagination logic
    const totalPages = Math.ceil(filteredUserBets.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentBets = filteredUserBets.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="border border-gray-200 p-6">
            <h2 className="text-lg mb-4 text-center">Bet History</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            {adminPage && <th className="p-2 text-left">Username</th>}
                            <th className="p-2 text-left">Question</th>
                            <th className="p-2 text-left">Bet Amount</th>
                            <th className="p-2 text-left">Bet Side</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Bet Time</th>
                            <th className="p-2 text-left">Gain/Loss</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBets.map((bet, i) => (
                            <tr key={startIndex + i} className="border-b">
                                {adminPage && <td className="p-2">{bet.username}</td>}
                                <td className="p-2">{bet.question}</td>
                                <td className="p-2">${bet.amount.toFixed(2)}</td>
                                <td className="p-2">{bet.side}</td>
                                <td className="p-2">{bet.status}</td>
                                <td className="p-2 flex flex-col justify-center items-start">
                                    <span>{new Date(bet.createdAt).toLocaleDateString("en-GB")}</span>
                                    <span>{new Date(bet.createdAt).toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                </td>
                                <td className={`p-2 ${bet.status === "win" ? "text-green-600" : bet.status === "lose" ? "text-red-600" : ""}`}>
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