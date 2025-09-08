"use client"

import type React from "react"
import WithdrawTable from "@/components/WithdrawTable"
import { useEffect, useState } from "react"
import axios from "axios"
import { WithdrawType } from "@/types"
import { useUser } from "@/store"

export default function AdminWithdrawPage() {
  const [withdraws, setWithdraws] = useState<WithdrawType[]>([])
  const { username } = useUser()
  useEffect(() => {
    axios.get("/api/withdraw", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => {
        setWithdraws(withdraw)
      })
  }, [])
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {username && <WithdrawTable withdraws={withdraws} username={username} adminPage />}
    </div>
  )
}
