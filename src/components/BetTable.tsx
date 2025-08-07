"use client"

import { BetType } from "@/types"
import { useState } from "react"

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
                                <td className={`p-2 ${bet.status === "win" ? "text-green-600" : bet.status === "lose" ? "text-red-600" : ""}`}>
                                    {bet.status === "win" ? `+$${(bet.amount * (bet.lineData[bet.side] - 1)).toFixed(2)}` : bet.status === "lose" ? `-$${bet.amount.toFixed(2)}` : ""}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredUserBets.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredUserBets.length)} of {filteredUserBets.length} bets
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-1 border ${currentPage === page
                                    ? "bg-black text-white border-black"
                                    : "border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
export default BetTable