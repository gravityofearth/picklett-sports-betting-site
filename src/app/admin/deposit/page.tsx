"use client"
import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import { DepositType } from "@/types"
import DepositTable from "@/components/DepositTable"
import jwt from "jsonwebtoken"

export default function AdminDepositsPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [deposits, setDeposits] = useState<DepositType[]>([])
  const logout = () => {
    localStorage.removeItem("jwt")
    router.push("/login")
  }
  useEffect(() => {
    const storedUsername = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
    setUsername(storedUsername)
    axios.get("/api/deposit", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { deposit } }) => {
        setDeposits(deposit)
      })
  }, [])
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Admin Panel</h1>
        <div className="flex gap-2">
          <Link href="/admin">Back</Link>
          <button className="cursor-pointer" onClick={logout}>Logout</button>
        </div>
      </div>
      <DepositTable userDeposits={deposits} username={username} adminPage />
    </div>
  )
}
