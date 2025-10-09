"use client"

import { CircularIndeterminate } from "@/components/Circular";
import { vaultBalanceType } from "@/types"
import { convertTimestamp2HumanReadablePadded } from "@/utils";
import axios from "axios";
import { useEffect, useRef, useState } from "react"

export default function VaultBalances() {
    const [timeRemaining, setTimeReamining] = useState("")
    const [balances, setBalances] = useState<vaultBalanceType[]>([])
    const timeOffset_ref = useRef(0)
    useEffect(() => {
        axios.get('/api/vault/balance', { headers: { token: localStorage.getItem("jwt") }, })
            .then(({ data: { balances, basets } }: { data: { balances: vaultBalanceType[], basets: number } }) => {
                setBalances(balances)
                timeOffset_ref.current = new Date().getTime() - basets
            })
        const t_out = setInterval(() => {
            const UTC_0 = new Date().setUTCHours(0, 0, 0) + 24 * 60 * 60 * 1000
            setTimeReamining(convertTimestamp2HumanReadablePadded(UTC_0 - timeOffset_ref.current - new Date().getTime()))
        }, 1000);
        return () => clearInterval(t_out)
    }, [])
    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-10">
            <div className="text-xl text-center">
                After {timeRemaining}, vault assets will be transferred to admin wallet.
            </div>
            <div className="w-full p-4 border flex flex-col gap-8">
                <h1 className="w-full text-center text-2xl">Vault Balances</h1>
                <div className="w-full flex flex-col gap-4 overflow-x-auto">
                    {balances.map(({ currencies, address, network }, i) =>
                        <div key={i}>
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
