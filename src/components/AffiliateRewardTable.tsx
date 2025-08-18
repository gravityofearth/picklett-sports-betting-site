"use client"

import { AffiliateRewardType } from "@/types"
import { useState } from "react"

const AffiliateRewardTable = ({ rewards, adminPage }: { rewards: AffiliateRewardType[], adminPage?: boolean }) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Pagination logic
    const totalPages = Math.ceil(rewards.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentRewards = rewards.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="border border-gray-200 p-6">
            <h2 className="text-lg mb-4 text-center">Affiliate Rewards</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2 text-left">Cycle</th>
                            {adminPage && <th className="p-2 text-left">Referrer</th>}
                            <th className="p-2 text-center">Number of Referees</th>
                            <th className="p-2 text-left">Total Bets</th>
                            <th className="p-2 text-left">Net Revenue</th>
                            <th className="p-2 text-left">Commission Rate</th>
                            <th className="p-2 text-left">Affiliate Earning</th>
                            <th className="p-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRewards.map((reward, i) => (
                            <tr key={startIndex + i} className="border-b">
                                <td className="p-2 whitespace-nowrap text-sm">
                                    <p>{new Date(reward.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}~</p>
                                    <p>&nbsp;&nbsp;{new Date(reward.endsAt - 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</p>
                                </td>
                                {adminPage && <td className="p-2">{reward.referrer}</td>}
                                <td className="p-2 text-center">{reward.detail.length}</td>
                                <td className="p-2">${reward.totalBets}</td>
                                <td className="p-2">${reward.revenue}</td>
                                <td className="p-2">5%</td>
                                <td className="p-2">${reward.earning}</td>
                                <td className={`p-2 text-green-600`}>Paid</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {rewards.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, rewards.length)} of {rewards.length} bets
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
export default AffiliateRewardTable