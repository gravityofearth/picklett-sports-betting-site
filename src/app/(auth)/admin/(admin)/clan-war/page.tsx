"use client"

import { CircularIndeterminate } from "@/components/MUIs"
import { showToast } from "@/utils"
import axios from "axios"
import { useState } from "react"

export default function ClanWarCreation() {
    const [sending, setSending] = useState(false)
    const [prize, setPrize] = useState(100)
    const [stake, setStake] = useState(50)
    const [slots, setSlots] = useState(2)
    const [minMembers, setMinMembers] = useState(5)
    const createWar = () => {
        if (Math.min(prize, stake) < 0) return
        if (Math.min(slots, minMembers) < 2) return
        setSending(true)
        axios.post(`/api/clan/war/create`, { prize, stake, slots, minMembers }, { headers: { token: localStorage.getItem("jwt") } })
            .then(() => {
                showToast("Clan war created successfully", "success")
            }).catch((e) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            }).finally(() => setSending(false))
    }
    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <span>Select War Type</span>
                <select name="war type" id="war-type" className="border border-white/20 p-2">
                    <option value="24hr-war">
                        24 Hours War
                    </option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <span>Prize Pool ($)</span>
                <input value={prize} onChange={(e) => setPrize(Number(e.target.value))} type="number" className="border border-white/20 p-2" />
            </div>
            <div className="flex flex-col gap-2">
                <span>Clan Stake ($)</span>
                <input value={stake} onChange={(e) => setStake(Number(e.target.value))} type="number" className="border border-white/20 p-2" />
            </div>
            <div className="flex flex-col gap-2">
                <span>Number of Clans</span>
                <input value={slots} onChange={(e) => setSlots(Number(e.target.value))} type="number" className="border border-white/20 p-2" />
            </div>
            <div className="flex flex-col gap-2">
                <span>Exact number of members per clan</span>
                <input value={minMembers} onChange={(e) => setMinMembers(Number(e.target.value))} type="number" className="border border-white/20 p-2" />
            </div>
            <div className="flex justify-center">
                {sending ? <CircularIndeterminate /> :
                    <button onClick={createWar} disabled={sending} className="w-40 bg-[#1475E1] rounded-lg px-2 py-3 cursor-pointer hover:bg-[#448ee2] disabled:cursor-not-allowed">Create War</button>
                }
            </div>
        </div>
    )
}
