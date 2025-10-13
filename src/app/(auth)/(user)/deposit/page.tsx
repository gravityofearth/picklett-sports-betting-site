"use client"

import { useEffect, useState } from "react"
import { CurrencyDict, showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { FilteringOption, FilteringSelect } from "@/components/FilteringSelect"
import { useRouter } from "next/navigation"
import { CircularIndeterminate } from "@/components/Circular"

export default function DepositPage() {
    const [currency, setCurrency] = useState("BTC")
    const [network, setNetwork] = useState("Bitcoin")
    const [sending, setSending] = useState(false)
    const router = useRouter()
    useEffect(() => { setNetwork(CurrencyDict[currency]?.availableNetworks[0]) }, [currency])
    const requestDeposit = async () => {
        setSending(true)
        axios.post(`/api/deposit/initiate`, { currency, network }, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { id } }) => {
                router.push(`/deposit/${id}`)
            }).catch((e: AxiosError) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            })
    }
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-7xl flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Deposit Funds</h1>
                    <p className="text-[#99A1AF]">If you would like to deposit other game currency like old school runescape GP, please open a ticket on discord</p>
                </div>
                <div className="flex justify-center">
                    <div className="w-md p-8 bg-linear-to-r from-[#0F172B80] to-[#1D293D4D] border border-[#31415880] rounded-[10px] flex flex-col gap-8">
                        <div className="flex gap-2 items-center">
                            <svg className="w-6 h-6"><use href="#svg-dollar-blue" /></svg>
                            <h2 className="text-xl">Deposit Funds</h2>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex justify-center items-center p-2 border border-[#01A3DB] bg-[#01A3DB]`}>1</div>
                                <div className={`h-[2px] w-10 bg-[#E5E5E566]`}></div>
                                <div className={`w-10 h-10 rounded-full flex justify-center items-center p-2 border border-[#E5E5E566]`}>2</div>
                                <div className={`h-[2px] w-10 bg-[#E5E5E566]`}></div>
                                <div className={`w-10 h-10 rounded-full flex justify-center items-center p-2 border border-[#E5E5E566]`}>3</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 items-center">
                            <div className="w-full flex flex-col gap-10">
                                <div className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-2">
                                        <div className="block text-sm text-[#D1D5DC]">Currency</div>
                                        <FilteringSelect value={CurrencyDict[currency]?.element || CurrencyDict["BTC"]?.element}>
                                            {
                                                Object.keys(CurrencyDict).map((currency, i) =>
                                                    <FilteringOption key={i} onClick={() => setCurrency(currency)} value={CurrencyDict[currency]?.element} />
                                                )
                                            }
                                        </FilteringSelect>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="block text-sm text-[#D1D5DC]">Network</div>
                                        <FilteringSelect value={network || "Select Network"}>
                                            {CurrencyDict[currency]?.availableNetworks.map((net) => <FilteringOption key={net} onClick={() => setNetwork(net)} value={net} />)}
                                        </FilteringSelect>
                                    </div>
                                </div>
                                {sending ?
                                    <div className="w-full flex justify-center"><CircularIndeterminate /></div> :
                                    <button onClick={requestDeposit} className="w-full py-2 bg-[#01A3DB] hover:bg-[#45bce4] cursor-pointer disabled:cursor-not-allowed border border-[#364153] rounded-[10px] font-semibold">
                                        Next
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}