"use client"

import { LeaderType } from "@/types"
import { useState } from "react"

const LeaderTable = ({ leaders, adminPage }: { leaders: LeaderType[], adminPage?: boolean }) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Pagination logic
    const totalPages = Math.ceil(leaders.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentLeaders = leaders.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="border border-gray-200 p-6">
            <h2 className="text-lg text-center">Leader Board</h2>
            <div className=" my-2 text-sm">*Only more than 2 winstreak will show up in the leaderboard.</div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            {true && <th className="p-2 text-left">Username</th>}
                            <th className="p-2 text-left">winstreak</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLeaders.map((leader, i) => (
                            <tr key={startIndex + i} className="border-b">
                                {true && <td className="p-2">{leader.username}</td>}
                                <td className="p-2">{leader.winstreak}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {leaders.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, leaders.length)} of {leaders.length} bets
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
export default LeaderTable