import { AffiliateRewardType, BetType, DepositType, LeaderType, LineType, RedemptionType, WithdrawType } from "@/types";
import { useEffect, useState } from "react";

export default function Pagination({ params: {
    items, itemsPerPage, startIndex, endIndex, currentPage, totalPages, goToPage }
}: {
    params: {
        items: (AffiliateRewardType | BetType | DepositType | LeaderType | RedemptionType | WithdrawType | LineType)[],
        itemsPerPage: number,
        startIndex: number,
        endIndex: number,
        currentPage: number,
        totalPages: number,
        goToPage: (page: number) => void
    }
}) {
    const [middlePagers, setMiddlePagers] = useState<number[]>([])
    useEffect(() => {
        const pagers = []
        if (currentPage > 1) pagers.push(currentPage - 1)
        pagers.push(currentPage)
        if (currentPage < totalPages) pagers.push(currentPage + 1)
        setMiddlePagers(pagers)
    }, [currentPage, totalPages])
    return (
        <>
            {items.length > itemsPerPage && (
                <div className="px-6 pb-6">
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm max-md:hidden text-[#99A1AF]">
                            Showing {startIndex + 1} to {Math.min(endIndex, items.length)} of {items.length} items
                        </div>
                        <div className="text-sm md:hidden text-gray-600">
                            {startIndex + 1}~{Math.min(endIndex, items.length)} / {items.length}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 rounded-full border border-[#6E7076] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#01A3DB] cursor-pointer"
                            >
                                <svg className="w-4 h-4 stroke-white"><use href="#svg-first" /></svg>
                            </button>
                            {currentPage > 2 && <span>...</span>}
                            {middlePagers.map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-[2px] rounded-full ${currentPage === page
                                        ? "bg-[#01A3DB] text-white cursor-not-allowed"
                                        : "border border-[#6E7076] hover:border-[#01A3DB] cursor-pointer"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            {currentPage < totalPages - 1 && <span>...</span>}
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 rounded-full border border-[#6E7076] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#01A3DB] cursor-pointer"
                            >
                                <svg className="w-4 h-4 stroke-white rotate-180"><use href="#svg-first" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}