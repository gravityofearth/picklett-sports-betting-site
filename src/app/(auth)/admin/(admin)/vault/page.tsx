"use client"

import { CircularIndeterminate } from "@/components/MUIs"
import { VaultBalanceType } from "@/types"
import { convertTimestamp2HumanReadablePadded } from "@/utils";
import axios from "axios";
import { useEffect, useRef, useState } from "react"

export default function VaultBalances() {
    const [timeRemaining, setTimeReamining] = useState("")
    const [balances, setBalances] = useState<VaultBalanceType[]>([])
    const timeOffset_ref = useRef(0)
    useEffect(() => {
        axios.get('/api/vault/balance', { headers: { token: localStorage.getItem("jwt") }, })
            .then(({ data: { balances, basets } }: { data: { balances: VaultBalanceType[], basets: number } }) => {
                setBalances(balances)
                timeOffset_ref.current = Date.now() - basets
            })
        const t_out = setInterval(() => {
            const UTC_0 = new Date().setUTCHours(0, 0, 0) + 24 * 60 * 60 * 1000
            setTimeReamining(convertTimestamp2HumanReadablePadded(UTC_0 - timeOffset_ref.current - Date.now()))
        }, 1000);
        return () => clearInterval(t_out)
    }, [])
    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-2">
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <img src="https://api.cron-job.org/jobs/6689377/a671e9a379dab637/status-3.svg" />
            </div>
            <div className="flex flex-col gap-2 w-full p-6 border border-[#00fe7f65] bg-[#00fe7f1e]">
                {/* <p className="text-[#FFB900]">Note:</p> */}
                <p className="text-[#00fe7fb7]">After {timeRemaining}, vault assets will be transferred to admin wallet.</p>
            </div>
            <div className="w-full flex flex-col">
                <h1 className="w-full text-center text-2xl py-4">Vault Balances</h1>
                <div className="w-full flex flex-col overflow-x-auto">
                    {balances.map(({ currencies, address, network }, i) =>
                        <div key={i} className={`px-2 py-3 hover:bg-white/10 hover:cursor-pointer ${i % 2 === 0 ? "bg-white/5" : "bg-white/1"}`}>
                            <div >{network}: {address}</div>
                            <div className="px-2">
                                {currencies.map(({ amount: { USD, coin }, currency }, i) =>
                                    <span key={i} className="">&#8226; {coin}{currency} = ${USD}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {balances.length === 0 && <div className="w-full flex justify-center"><CircularIndeterminate /></div>}
            </div>
        </div>
    )
}
