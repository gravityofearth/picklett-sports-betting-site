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
    const totalPages = Math.ceil(filteredWithdraws.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentWithdraws = filteredWithdraws.slice(startIndex, endIndex)
    const router = useRouter()
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }
    return (
        <div className="flex flex-col gap-6 pt-6 bg-linear-0 from-[#0F172B80] to-[#1D293D4D] border border-[#36415380] rounded-2xl">
            <div className="px-6 flex flex-col gap-2">
                <h2 className="text-2xl">Withdraw History</h2>
                <p className="text-[#99A1AF]">Complete record of all withdrawal transactions</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-y border-[#36415380] bg-[#1E29394D]">
                            {adminPage && <th className="pl-6 py-6 pr-2 text-left text-sm text-[#D1D5DC]">Username</th>}
                            <th className={`${adminPage ? "px-2" : "pl-6 pr-2"} py-6 text-left text-sm text-[#D1D5DC]`}>Amount</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Recipient Address</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Currency</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Status</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Result</th>
                            <th className="pl-2 py-6 pr-6 text-left text-sm text-[#D1D5DC]">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentWithdraws.map((withdraw, i) => (
                            <tr onClick={() => {
                                if (!adminPage) return
                                router.push(`/admin/withdraw/${withdraw._id}`)
                            }} key={startIndex + i} className={`${adminPage && "border-b hover:bg-gray-800 cursor-pointer"}`}>
                                {adminPage &&
                                    <td className="pl-6 py-6 pr-2 whitespace-nowrap text-sm">{withdraw.username}</td>
                                }
                                <td className={`${adminPage ? "px-2" : "pl-6 pr-2"} py-6`}>
                                    <div className="flex gap-2 items-center">
                                        <svg className="w-4 h-4"><use href="#svg-wallet" /></svg>
                                        <span className="text-[18px]">${withdraw.amount.toFixed(2)}</span>
                                    </div>
                                </td>
                                <td className="py-6 px-2 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <code className="text-[#D1D5DC] text-sm">{withdraw.address.substring(0, 6)}...{withdraw.address.substring(38)}</code>
                                        <code className="text-[#6A7282] text-xs">{withdraw.address.substring(0, 20)}...</code>
                                    </div>
                                </td>
                                <td className="py-6 px-2">
                                    <code className="text-[#D1D5DC] text-sm">{withdraw.currency} ({withdraw.network})</code>
                                </td>
                                <td className="py-6 px-2">
                                    <div className="flex gap-2 items-center">
                                        <svg className="w-4 h-4"><use href={`#svg-${withdraw.result === "success" ? "redeem" : withdraw.result === "failed" ? "failed" : "pending"}`} /></svg>
                                        <div className={`py-1 px-3 rounded-md border text-xs ${withdraw.result === "success" ? "text-[#00D492] bg-[#00BC7D1A] border-[#00BC7D33]" : withdraw.result === "failed" ? "text-[#FF6467] bg-[#FB2C361A] border-[#FB2C3633]" : "text-[#FFBA00] bg-[#FE9A001A] border-[#FE9A0033]"}`}>{withdraw.result}</div>
                                    </div>
                                </td>
                                <td className="py-6 px-2">
                                    {
                                        (withdraw.tx && withdraw.tx !== "undefined") ?
                                            <a target="_blank" href={`https://${withdraw.network === "Bitcoin" ? "mempool.space" :
                                                withdraw.network === "Solana" ? "solscan.io" :
                                                    ""
                                                }/tx/${withdraw.tx}`} className="text-[#01A3DB] flex gap-2 items-center">Link<svg className="w-4 h-4"><use href="#svg-export" /></svg></a> :
                                            <span className="text-sm"></span>
                                    }
                                </td>
                                <td className="pl-2 py-5 pr-6 flex flex-col justify-center items-start">
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