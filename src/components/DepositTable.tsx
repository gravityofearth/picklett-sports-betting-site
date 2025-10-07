"use client"

import { DepositType } from "@/types"
import { useState } from "react"
import Pagination from "./Pagination"
import { useRouter } from "next/navigation"

const DepositTable = ({ userDeposits, username, adminPage }: { userDeposits: DepositType[], username: string, adminPage?: boolean }) => {
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const filteredUserDeposits = userDeposits.filter(v => adminPage || v.username === username)
    const totalPages = Math.ceil(filteredUserDeposits.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentDeposits = filteredUserDeposits.slice(startIndex, endIndex)
    const router = useRouter()
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }
    return (
        <div className="flex flex-col gap-6 pt-6 bg-linear-0 from-[#0F172B80] to-[#1D293D4D] border border-[#36415380] rounded-2xl">
            <div className="px-6 flex flex-col gap-2">
                <h2 className="text-2xl">Deposit History</h2>
                <p className="text-[#99A1AF]">Track your deposits here</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-y border-[#36415380] bg-[#1E29394D]">
                            {adminPage && <th className="pl-6 py-6 pr-2 text-left text-sm text-[#D1D5DC]">Username</th>}
                            <th className={`${adminPage ? "px-2" : "pl-6 pr-2"} py-6 text-left text-sm text-[#D1D5DC]`}>Amount</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">User Address</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Currency</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Deposit Time</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Status</th>
                            <th className="pl-2 py-6 pr-6 text-left text-sm text-[#D1D5DC]">Confirmations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDeposits.map((deposits, i) => (
                            <tr onClick={() => {
                                router.push(`/deposit/${deposits._id}`)
                            }} key={startIndex + i} className={`${adminPage && "border-b"} hover:bg-gray-800 cursor-pointer`}>
                                {adminPage &&
                                    <td className="pl-6 py-6 pr-2 whitespace-nowrap text-sm">{deposits.username}</td>
                                }
                                <td className={`${adminPage ? "px-2" : "pl-6 pr-2"} py-6`}>
                                    <div className="flex gap-2 items-center">
                                        <svg className="w-4 h-4"><use href="#svg-wallet" /></svg>
                                        {deposits.depositAmount > 0 && <span className="text-[18px]">${deposits.depositAmount}</span>}
                                    </div>
                                </td>
                                <td className="py-6 px-2 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <code className="text-[#D1D5DC] text-sm">{deposits.address}</code>
                                    </div>
                                </td>
                                <td className="py-6 px-2 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <code className="text-[#D1D5DC] text-sm">{deposits.currency} ({deposits.network})</code>
                                    </div>
                                </td>
                                <td className="px-2 py-5 flex flex-col justify-center items-start">
                                    <span>{new Date(deposits.expiresAt).toLocaleDateString("en-GB")}</span>
                                    <span>{new Date(deposits.expiresAt).toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                </td>
                                <td className="py-6 px-2">
                                    <div className="flex gap-2 items-center">
                                        <svg className="w-4 h-4"><use href={`#svg-${deposits.result === "success" ? "redeem" : deposits.result === "expired" ? "failed" : "pending"}`} /></svg>
                                        <div className={`py-1 px-3 rounded-md border text-xs ${deposits.result === "success" ? "text-[#00D492] bg-[#00BC7D1A] border-[#00BC7D33]" : deposits.result === "expired" ? "text-[#FF6467] bg-[#FB2C361A] border-[#FB2C3633]" : "text-[#FFBA00] bg-[#FE9A001A] border-[#FE9A0033]"}`}>{deposits.result}</div>
                                    </div>
                                </td>
                                <td className="pl-2 py-6 pr-6 text-sm">{deposits.confirmations}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination params={{
                items: filteredUserDeposits,
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
export default DepositTable