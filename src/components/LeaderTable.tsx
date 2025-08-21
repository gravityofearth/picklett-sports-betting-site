"use client"

import { LeaderType } from "@/types"
import { useState } from "react"
import Pagination from "./Pagination"

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