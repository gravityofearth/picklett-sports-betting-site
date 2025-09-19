"use client"
import AdminPage from "@/components/AdminPage";
import RedemptionTable from "@/components/RedemptionTable";
import { RedemptionType } from "@/types";
import { showToast, validateCurrency } from "@/utils";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";

export default function Home() {
    const [tab, setTab] = useState<"line" | "redemption">("line")
    return (
        <div className="">
            <div className="w-full flex justify-center items-center gap-2">
                <img src="https://api.cron-job.org/jobs/6481181/74895d2b308e8173/status-3.svg" />
                <img src="https://api.cron-job.org/jobs/6609976/211a340519d547e6/status-3.svg" />
            </div>
            <div className="w-full flex justify-center items-center gap-4">
                <button onClick={() => setTab("line")} className={`${tab === "line" && "text-purple-600"} cursor-pointer`}>Line</button>
                <div className="w-[1px] h-4 bg-gray-500"></div>
                <button onClick={() => setTab("redemption")} className={`${tab === "redemption" && "text-purple-600"} cursor-pointer`}>Redemption</button>
            </div>
            {tab === "line" ?
                <AdminPage /> :
                <Redemption />
            }
        </div>
    )
}
function Redemption() {
    const [amount, setAmount] = useState("")
    const [sendingRequest, setSendingRequest] = useState(false)
    const [redemptions, setRedemptions] = useState<RedemptionType[]>([])
    useEffect(() => {
        axios.get(`/api/redemption`, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { redemptions } }) => {
                setRedemptions(redemptions)
            })
    }, [])
    const handleGenerate = async () => {
        if (amount.trim() === "") {
            showToast("Enter amount", "warn")
            return
        }
        setSendingRequest(true)
        axios.post(`/api/redemption`, { amount: parseFloat(amount) }, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { redemption } }) => {
                setRedemptions(v => ([redemption, ...v]))
                setAmount("")
                showToast("Created redemption code successfully", "success")
            }).catch((e: AxiosError) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            }).finally(() => setSendingRequest(false))
    }
    return (
        <div className="max-w-2xl w-full mx-auto ">
            <div className="p-6 flex flex-col gap-6 border border-gray-200 my-6">
                <h1 className="text-lg">Generate Redemption Code</h1>
                <div className="flex justify-center items-end gap-4">
                    <div className="w-full">
                        <label htmlFor="redemption" className="block mb-2 text-sm">
                            Amount
                        </label>
                        <div className="w-full flex gap-1 items-center">
                            <span>$</span>
                            <input
                                id="redemption"
                                type="text"
                                value={amount}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === "" || validateCurrency(v)) {
                                        setAmount(v.trim())
                                    } else if (v === ".") {
                                        setAmount("0.")
                                    }
                                }}
                                className="w-full h-10 p-2 border border-gray-300"
                                placeholder="10.00"
                            />
                        </div>
                    </div>
                    <button onClick={handleGenerate} className="w-full p-2 text-white bg-black hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
                        Generate
                    </button>
                </div>
            </div>
            <RedemptionTable redemptions={redemptions} setRedemptions={setRedemptions} />
        </div>
    )
}