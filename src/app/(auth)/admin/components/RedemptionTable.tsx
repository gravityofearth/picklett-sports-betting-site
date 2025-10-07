"use client"

import Pagination from "@/components/Pagination"
import { useUser } from "@/store"
import { RedemptionType } from "@/types"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { SetStateAction, useState } from "react"

const RedemptionTable = ({ redemptions, setRedemptions }: { redemptions: RedemptionType[], setRedemptions: (value: SetStateAction<RedemptionType[]>) => void }) => {
    const { setToken } = useUser()
    const [sendingRequest, setSendingRequest] = useState(false)
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Pagination logic
    const totalPages = Math.ceil(redemptions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentRedemptions = redemptions.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="border border-gray-200 p-6">
            <h2 className="text-lg mb-4 text-center">Redemption History</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2 text-left">Code</th>
                            <th className="p-2 text-left">Link</th>
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Username</th>
                            <th className="p-2 text-left"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRedemptions.map((redemption, i) => (
                            <tr key={redemption.code} className="border-b">
                                <td className="p-2">{redemption.code}</td>
                                <td className="p-2">
                                    <button className="cursor-pointer underline" onClick={async () => {
                                        await navigator.clipboard.writeText(`${location.protocol}//${location.host}/redemption?redeem=${redemption.code}`)
                                        showToast("Copied Redemption Link", "info")
                                    }}>Copy link</button>
                                </td>
                                <td className="p-2">${redemption.amount.toFixed(2)}</td>
                                <td className="p-2">{redemption.status}</td>
                                <td className="p-2">{redemption.username}</td>
                                <td className="p-2">
                                    {redemption.status === "pending" &&
                                        <button onClick={() => {
                                            setSendingRequest(true)
                                            axios.post(`/api/redemption/redeem`, { code: redemption.code }, { headers: { token: localStorage.getItem("jwt") } })
                                                .then(({ data: { redemption, token } }) => {
                                                    setRedemptions(v => v.map(vv => vv.code !== redemption.code ? vv : redemption))
                                                    setToken(token)
                                                })
                                                .catch((e: AxiosError) => {
                                                    showToast(e.response?.statusText || "Unknown Error", "error")
                                                }).finally(() => setSendingRequest(false))
                                        }} className="cursor-pointer underline disabled:cursor-not-allowed" disabled={sendingRequest}>Cancel</button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination params={{
                items: redemptions,
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
export default RedemptionTable