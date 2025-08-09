"use client"

import { WithdrawType } from "@/types"
import { useRouter } from "next/navigation"
import { useState } from "react"

const WithdrawTable = ({ withdraws, username, adminPage }: { withdraws: WithdrawType[], username: string, adminPage?: boolean }) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const filteredWithdraws = withdraws.filter(v => adminPage || v.username === username)
    // Pagination logic
    const totalPages = Math.ceil(filteredWithdraws.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentWithdraws = filteredWithdraws.slice(startIndex, endIndex)
    const router = useRouter()

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="border border-gray-200 p-6">
            <h2 className="text-lg mb-4 text-center">Withdraw History</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            {adminPage && <th className="p-2 text-left">Username</th>}
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Wallet Address</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Result</th>
                            <th className="p-2 text-left">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentWithdraws.map((withdraw, i) => (
                            <tr onClick={() => {
                                if (!adminPage) return
                                router.push(`/admin/withdraw/${withdraw._id}`)
                            }} key={startIndex + i} className={`border-b ${adminPage && "hover:bg-gray-200 cursor-pointer"}`}>
                                {adminPage && <td className="p-2">{withdraw.username}</td>}
                                <td className="p-2">${withdraw.amount.toFixed(2)}</td>
                                <td className="p-2 text-sm">
                                    <code>{withdraw.wallet.substring(0, 6)}...{withdraw.wallet.substring(38)}</code>
                                </td>
                                <td className="p-2">{withdraw.result}</td>
                                <td className="p-2">
                                    {
                                        withdraw.tx !== "undefined" ?
                                            <a target="_blank" href={`https://etherscan.com/tx/${withdraw.tx}`}>🔗 Link</a> :
                                            <span className="text-red-700 text-sm">{withdraw.reason}</span>
                                    }
                                </td>
                                <td className="p-2 flex flex-col justify-center items-start">
                                    <span>{new Date(withdraw.createdAt).toLocaleDateString("en-GB")}</span>
                                    <span>{new Date(withdraw.createdAt).toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredWithdraws.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredWithdraws.length)} of {filteredWithdraws.length} bets
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
export default WithdrawTable