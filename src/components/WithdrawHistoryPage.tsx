"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import WithdrawTable from "@/components/WithdrawTable"
import { WithdrawType } from "@/types"
import { useUser } from "@/store"
import SumCard from "@/components/SumCard"

export default function WithdrawHistoryPage() {
  const { username } = useUser()
  const [withdraws, setWithdraws] = useState<WithdrawType[]>([])
  useEffect(() => {
    axios.get("/api/withdraw", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => {
        setWithdraws(withdraw)
      })
  }, [])
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="w-full grid grid-cols-3 max-md:grid-cols-1 gap-6">
          <SumCard icon="redeem" amount={withdraws.filter(v => v.result === "success").length.toString()} heading="Success" description="Completed withdrawals" color="#00D492" />
          <SumCard icon="pending" amount={withdraws.filter(v => v.result === "pending").length.toString()} heading="Pending" description="Processing withdrawals" color="#FFBA00" />
          <SumCard icon="failed" amount={withdraws.filter(v => v.result === "failed").length.toString()} heading="Fail" description="Unsuccessful attempts" color="#FF6467" />
        </div>
        {username && <WithdrawTable withdraws={withdraws} username={username} />}
        {/* <div className="w-full flex max-md:flex-col gap-2 justify-between bg-linear-to-r from-[#1018284D] to-[#1E293933] p-6 rounded-[10px] border border-[#3641534D]">
          <div className="flex flex-col justify-between">
            <p>Need Help?</p>
            <p className="text-sm text-[#99A1AF]">If you have any questions about your withdrawals, please contact our support team.</p>
          </div>
          <button className="py-4 px-6 border border-[#01A3DB] rounded-xl">Contact Support</button>
        </div> */}
      </div>
    </div>
  )
}