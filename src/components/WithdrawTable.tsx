"use client"

import { WithdrawType } from "@/types"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Pagination from "./Pagination"

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

            <Pagination params={{
                items: filteredWithdraws,
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
export default WithdrawTable