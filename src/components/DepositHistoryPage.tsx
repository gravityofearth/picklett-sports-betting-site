"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useUser } from "@/store"
import { DepositType } from "@/types"
import DepositTable from "@/components/DepositTable"
import SumCard from "@/components/SumCard"

export default function DepositHistoryPage() {
  const { username } = useUser()
  const [deposits, setDeposits] = useState<DepositType[]>([])
  useEffect(() => {
    if (!localStorage.getItem("jwt")) return
    axios.get("/api/deposit", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { deposit } }) => {
        setDeposits(deposit)
      })
  }, [])
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="w-full grid grid-cols-3 max-md:grid-cols-1 gap-6">
          <SumCard icon="redeem" amount={deposits.filter(v => v.result === "success").length.toString()} heading="Success" description="Completed deposits" color="#00D492" />
          <SumCard icon="pending" amount={deposits.filter(v => v.result === "confirming").length.toString()} heading="Pending" description="Pending deposits" color="#FFBA00" />
          <SumCard icon="failed" amount={deposits.filter(v => v.result === "expired").length.toString()} heading="Expired" description="Expired deposits" color="#FF6467" />
        </div>
        {username && <DepositTable userDeposits={deposits} username={username} />}
      </div>
    </div>
  )
}