"use client"
import type React from "react"
import Link from "next/link"
import jwt from "jsonwebtoken"
import WithdrawTable from "@/components/WithdrawTable"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import { WithdrawType } from "@/types"

export default function AdminWithdrawPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [withdraws, setWithdraws] = useState<WithdrawType[]>([])
  const logout = () => {
    localStorage.removeItem("jwt")
    router.push("/login")
  }
  useEffect(() => {
    const storedUsername = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
    setUsername(storedUsername)
    axios.get("/api/withdraw", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => {
        setWithdraws(withdraw)
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
      <WithdrawTable withdraws={withdraws} username={username} adminPage />
    </div>
  )
}
