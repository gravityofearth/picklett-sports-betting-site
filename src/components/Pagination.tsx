import { AffiliateRewardType, BetType, DepositType, LeaderType, RedemptionType, WithdrawType } from "@/types";

export default function Pagination({ params: {
    items, itemsPerPage, startIndex, endIndex, currentPage, totalPages, goToPage }
}: {
    params: {
        items: (AffiliateRewardType | BetType | DepositType | LeaderType | RedemptionType | WithdrawType)[],
        itemsPerPage: number,
        startIndex: number,
        endIndex: number,
        currentPage: number,
        totalPages: number,
        goToPage: (page: number) => void
    }
}) {
    return (
        <>
            {items.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm max-md:hidden text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, items.length)} of {items.length} items
                    </div>
                    <div className="text-sm md:hidden text-gray-600">
                        {startIndex + 1}~{Math.min(endIndex, items.length)} / {items.length}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            &lt;
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
                            &gt;
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}