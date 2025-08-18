"use client"
import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { DepositType } from "@/types"
import DepositTable from "@/components/DepositTable"
import { useUser } from "@/store"

export default function AdminDepositsPage() {
  const { username } = useUser()
  const [deposits, setDeposits] = useState<DepositType[]>([])
  useEffect(() => {
    axios.get("/api/deposit", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { deposit } }) => {
        setDeposits(deposit)
      })
  }, [])
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {username && <DepositTable userDeposits={deposits} username={username} adminPage />}
    </div>
  )
}
