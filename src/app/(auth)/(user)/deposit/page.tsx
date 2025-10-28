"use client"

import { useEffect, useState } from "react"
import { CurrencyDict, showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { FilteringOption, FilteringSelect } from "@/components/FilteringSelect"
import { useRouter } from "next/navigation"
import { CircularIndeterminate } from "@/components/MUIs"
import { CoinDisplay } from "@/components/Miscellaneous"
import Link from "next/link"

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
            <div className="w-full flex flex-col gap-6">
                <div className="flex justify-center">
                    <div className="w-lg p-8 max-md:p-4 bg-[#0E1B2F] border border-[#31415880] rounded-[10px] flex flex-col gap-6">
                        <div className="w-full flex justify-center gap-20 border-b border-white/10">
                            <Link href="/deposit" className="border-b text-center cursor-pointer select-none border-[#1475E1]">Deposit</Link>
                            <Link href="/withdraw" className="border-b text-center cursor-pointer select-none border-white/10">Withdraw</Link>
                        </div>
                        <div className="flex justify-center items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-9 h-9 rounded-full flex justify-center items-center p-2 border border-[#01A3DB] bg-[#01A3DB]`}>1</div>
                                <div className={`h-[2px] w-8 bg-[#E5E5E566]`}></div>
                                <div className={`w-9 h-9 rounded-full flex justify-center items-center p-2 bg-[#E5E5E566]`}>2</div>
                                <div className={`h-[2px] w-8 bg-[#E5E5E566]`}></div>
                                <div className={`w-9 h-9 rounded-full flex justify-center items-center p-2 bg-[#E5E5E566]`}>3</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 items-center">
                            <div className="w-full flex flex-col gap-6">
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="block text-sm">Currency</div>
                                        <FilteringSelect value={<CoinDisplay coin={currency} src={CurrencyDict[currency].url} />}>
                                            {
                                                Object.keys(CurrencyDict).map((currency, i) =>
                                                    <FilteringOption key={i} onClick={() => setCurrency(currency)} value={<CoinDisplay coin={currency} src={CurrencyDict[currency].url} />} />
                                                )
                                            }
                                        </FilteringSelect>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="block text-sm">Network</div>
                                        <FilteringSelect value={network || "Select Network"}>
                                            {CurrencyDict[currency]?.availableNetworks.map((net) => <FilteringOption key={net} onClick={() => setNetwork(net)} value={net} />)}
                                        </FilteringSelect>
                                    </div>
                                </div>
                                {sending ?
                                    <div className="w-full flex justify-center"><CircularIndeterminate /></div> :
                                    <button onClick={requestDeposit} className="w-full py-2 bg-[#01A3DB] hover:bg-[#45bce4] cursor-pointer disabled:cursor-not-allowed border border-[#364153] rounded-[10px] font-semibold">
                                        Continue
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