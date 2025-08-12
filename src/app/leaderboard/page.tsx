"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import jwt from "jsonwebtoken"
import Link from "next/link"
import axios from "axios"
import LeaderTable from "@/components/LeaderTable"
import { LeaderType } from "@/types"


export default function HomePage() {
  const [username, setUsername] = useState("")
  const [balance, setBalance] = useState<number>(0)
  const [leaders, setLeaders] = useState<LeaderType[]>([])
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem("jwt")
    router.push("/login")
  }
  const updateBalance = () => {
    setBalance((jwt.decode(localStorage.getItem("jwt")!) as any)?.balance || 0)
    const storedUsername = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
    if (!storedUsername) {
      router?.push("/login")
      return
    }
    setUsername(storedUsername)
  }
  useEffect(() => {
    updateBalance()
    axios.get('/api/leaders').then(({ data: { leaders } }) => {
      setLeaders(leaders)
    })
  }, [])
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-2">
          <span className="text-2xl">Welcome, {username}</span>
          <div>Balance: ${balance.toFixed(2)}</div>
        </div>
        <div className="flex gap-2">
          {username === "admin" && <Link href="/admin">Admin page</Link>}
          <Link href="/home">Back</Link>
          <button className="cursor-pointer" onClick={logout}>Logout</button>
        </div>
      </div>
      <LeaderTable leaders={leaders} />

    </div>
  )
}
