"use client"

import { LeaderType } from "@/types"
import { useState } from "react" 
import Image from "next/image"
import Pagination from "@/components/Pagination"

const LeaderTable = ({ leaders, adminPage }: { leaders: LeaderType[], adminPage?: boolean }) => {
    const [isError, setError] = useState(false)
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const totalPages = Math.ceil(leaders.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentLeaders = leaders.slice(startIndex, endIndex)
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }
    return (
        <div className="flex flex-col gap-6 pt-6 bg-linear-0 from-[#1018284D] to-[#1E293933] border border-[#36415380] rounded-2xl">
            <div className="px-6 flex flex-col gap-2">
                <h2 className="text-2xl">Winstreak Leaderboard</h2>
                <p className="text-[#99A1AF]">*Only more than 2 winstreak will show up in the leaderboard.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-y border-[#36415380] bg-[#1E29394D]">
                            <th className="pl-6 py-6 pr-2 text-left text-sm text-[#D1D5DC]"></th>
                            {true && <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Username</th>}
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Winstreak</th>
                            <th className="py-6 px-2 text-left text-sm text-[#D1D5DC]">Total Wins</th>
                            <th className="pl-2 py-6 pr-6 text-left text-sm text-[#D1D5DC]">Earning</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLeaders.map((leader, i) => (
                            <tr key={startIndex + i} className="">
                                <td className="pl-6 py-6 pr-2 whitespace-nowrap text-sm">{i + 1}</td>
                                {true &&
                                    <td className="py-3 px-2">
                                        <div className="flex gap-3 items-center">
                                            <div className="relative bg-[#364153] w-11 h-11 rounded-full flex justify-center items-center">
                                                <div className="flex justify-center items-center w-11 h-11 rounded-full overflow-hidden shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(/api/profile/avatar/${leader.avatar})` }}>
                                                    {leader.avatar && !isError ?
                                                        <Image onError={() => setError(true)} src={`/api/profile/avatar/${leader.avatar}`} className="w-0" width={44} height={44} alt="avatar" /> :
                                                        <svg className="w-5 h-5"><use href="#svg-user" /></svg>
                                                    }
                                                </div>
                                                {leader.winstreak >= 5 && <svg className="w-4 h-4 absolute -right-1 -bottom-1"><use href={`#svg-${leader.winstreak >= 10 ? "crown" : leader.winstreak >= 7 ? "silver" : "bronze"}`} /></svg>}
                                            </div>
                                            {leader.username}
                                        </div>
                                    </td>
                                }
                                <td className="py-6 px-2 flex gap-2 items-center text-[18px] text-[#FF8904]">
                                    <svg className="w-4 h-4"><use href="#svg-fire" /></svg>
                                    {leader.winstreak}
                                </td>
                                <td className="py-6 px-2">{leader.totalWins}</td>
                                <td className="pl-1 py-5 pr-5 text-[#05DF72]">-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination params={{
                items: leaders,
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
export default LeaderTable