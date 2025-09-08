"use client"

import BetTable from "@/components/BetTable"
import SumCard from "@/components/SumCard"
import { useUser } from "@/store"
import { BetType } from "@/types"
import axios from "axios"
import { useEffect, useState } from "react"

export default function BetHistory() {
    const { username } = useUser()
    const [userBets, setUserBets] = useState<BetType[]>([])
    useEffect(() => {
        axios.get("/api/bet", { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { bet } }) => {
                setUserBets(bet)
            })
    }, [])
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-7xl flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Bet History</h1>
                    <p className="text-[#99A1AF]">You can see your betting history</p>
                </div>
                <div className="w-full grid grid-cols-3 max-md:grid-cols-1 gap-6">
                    <SumCard amount={userBets.filter(v => v.status === "win").length.toString()} heading="Winning" description="Lifetime winning from betting" color="#00D492" icon="redeem" />
                    <SumCard amount={userBets.filter(v => v.status === "lose").length.toString()} heading="Losing" description="Lifetime losing from betting" color="#FF6467" icon="failed" />
                    <SumCard amount={userBets.filter(v => v.status === "pending").length.toString()} heading="Pending" description="Pending on the betting" color="#FFBA00" icon="pending" />
                </div>
                {username && <BetTable userBets={userBets} username={username} adminPage={username === "admin"} />}
            </div>
        </div>
    )
}