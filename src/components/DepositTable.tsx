"use client"

import { DepositType } from "@/types"
import { useState } from "react"

const DepositTable = ({ userDeposits, username, adminPage }: { userDeposits: DepositType[], username: string, adminPage?: boolean }) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const filteredUserDeposits = userDeposits.filter(v => adminPage || v.username === username)
    // Pagination logic
    const totalPages = Math.ceil(filteredUserDeposits.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentDeposits = filteredUserDeposits.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="border border-gray-200 p-6">
            <h2 className="text-lg mb-4 text-center">Deposit History</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            {adminPage && <th className="p-2 text-left">Username</th>}
                            <th className="p-2 text-left">Deposit Amount</th>
                            <th className="p-2 text-left">User Address</th>
                            <th className="p-2 text-left">Transaction</th>
                            <th className="p-2 text-left">Deposit Time</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Failed Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDeposits.map((deposits, i) => (
                            <tr key={startIndex + i} className="border-b">
                                {adminPage && <td className="p-2">{deposits.username}</td>}
                                <td className="p-2">${deposits.depositAmount}</td>
                                <td className="p-2"><code className="text-sm">{deposits.sender.substring(0, 6)}...{deposits.sender.substring(38)}</code></td>
                                <td className="p-2">{deposits.tx !== "undefined" ? <code className="text-sm">{deposits.tx.substring(0, 6)}...{deposits.tx.substring(61)}</code> : deposits.tx}</td>
                                <td className="p-2 flex flex-col justify-center items-start text-sm">
                                    <span>{new Date(deposits.createdAt).toLocaleDateString("en-GB")}</span>
                                    <span>{new Date(deposits.createdAt).toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                </td>
                                <td className={`p-2 ${deposits.result === "success" ? "text-green-600" : deposits.result === "failed" ? "text-red-600" : ""}`}>
                                    {deposits.result}
                                </td>
                                <td className="p-2 text-sm">{deposits.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredUserDeposits.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredUserDeposits.length)} of {filteredUserDeposits.length} deposits
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
export default DepositTable