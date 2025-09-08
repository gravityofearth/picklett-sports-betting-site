"use client"

import { AffiliateRewardType } from "@/types"
import { useState } from "react"
import Pagination from "./Pagination"

const AffiliateRewardTable = ({ rewards, adminPage }: { rewards: AffiliateRewardType[], adminPage?: boolean }) => {
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const totalPages = Math.ceil(rewards.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentRewards = rewards.slice(startIndex, endIndex)
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }
    return (
        <div className="flex flex-col gap-6 pt-6 bg-linear-0 from-[#1018284D] to-[#1E293933] border border-[#36415380] rounded-2xl">
            <div className="px-6 flex flex-col gap-2">
                <h2 className="text-2xl">Affiliate Rewards</h2>
                <p className="text-[#99A1AF]">Track your commission earnings by cycle</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-y border-[#36415380] bg-[#1E29394D]">
                            <th className="pl-6 py-6 pr-2 text-left text-sm text-[#D1D5DC]">Cycle</th>
                            {adminPage && <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Referrer</th>}
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Number of Referees</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Total Bets</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Net Revenue</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Commission Rate</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Affiliate Earning</th>
                            <th className="pl-2 py-6 pr-6 text-left text-sm text-[#D1D5DC]">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRewards.map((reward, i) => (
                            <tr key={startIndex + i} className="">
                                <td className="pl-6 py-3 pr-2 whitespace-nowrap text-sm">
                                    <p>{new Date(reward.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}~</p>
                                    <p>&nbsp;&nbsp;{new Date(reward.endsAt - 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</p>
                                </td>
                                {adminPage && <td className="py-6 px-2">{reward.referrer}</td>}
                                <td className="py-6 px-2 flex items-center gap-2">
                                    <svg className="w-4 h-4"><use href="#svg-referee" /></svg>
                                    {reward.detail.length}
                                </td>
                                <td className="py-6 px-2">${reward.totalBets}</td>
                                <td className="py-6 px-2 text-[#00D492]">${reward.revenue}</td>
                                <td className="py-6 px-2 text-[#C27AFF]">5%</td>
                                <td className="py-6 px-2 text-[#01A3DB]">${reward.earning}</td>
                                <td className="pl-1 py-5 pr-5"><div className="p-1 text-xs text-[#00D492] bg-[#00BC7D1A] border border-[#00BC7D33] text-center rounded-full">Paid</div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination params={{
                items: rewards,
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
export default AffiliateRewardTable