"use client"

import Pagination from "@/components/Pagination"
import { AffiliateRewardType } from "@/types"
import { useState } from "react"

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
        <div className="flex flex-col gap-6">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/10">
                            <th className="pl-6 py-4 pr-2 text-left text-sm font-normal rounded-l-2xl">Cycle</th>
                            {adminPage && <th className="py-4 px-2 text-left text-sm font-normal">Referrer</th>}
                            <th className="py-4 px-2 text-left text-sm font-normal">Number of Referees</th>
                            <th className="py-4 px-2 text-left text-sm font-normal">Total Bets</th>
                            <th className="py-4 px-2 text-left text-sm font-normal">Net Revenue</th>
                            <th className="py-4 px-2 text-left text-sm font-normal">Commission Rate</th>
                            <th className="py-4 px-2 text-left text-sm font-normal">Affiliate Earning</th>
                            <th className="pl-2 py-4 pr-6 text-left text-sm font-normal rounded-r-2xl">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRewards.map((reward, i) => (
                            <tr key={startIndex + i} className="">
                                <td className="pl-6 py-1 pr-2 whitespace-nowrap text-sm">
                                    <p>{new Date(reward.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}~</p>
                                    <p>&nbsp;&nbsp;{new Date(reward.endsAt - 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</p>
                                </td>
                                {adminPage && <td className="py-4 px-2">{reward.referrer}</td>}
                                <td className="py-4 px-2">{reward.detail.length}</td>
                                <td className="py-4 px-2">${reward.totalBets}</td>
                                <td className="py-4 px-2">${reward.revenue}</td>
                                <td className="py-4 px-2">5%</td>
                                <td className="py-4 px-2">${reward.earning}</td>
                                <td className="pl-1 py-3 pr-5"><div className="p-1 text-left rounded-full">Paid</div></td>
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