"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { DepositType } from "@/types"
import { useParams, useRouter } from "next/navigation"

export default function DepositPage() {
  const [deposit, setDeposit] = useState<DepositType | null>(null)
  const params = useParams();
  const router = useRouter()
  useEffect(() => {
    axios.get(`/api/deposit/${params.depositId}`)
      .then(({ data: { deposit } }) => setDeposit(deposit))
  }, [])
  useEffect(() => {
    if (!deposit) return
    if (!(deposit.result == "success" || deposit.result === "failed")) {
      router.push(`/deposit/${params.depositId}`)
    }
  }, [deposit])
  return (
    <div className="max-w-2xl mx-auto p-4">

      <Link href="/home" className="mb-4 px-4 py-2 border border-gray-300 block w-fit">Back to Home</Link>

      <div className="border border-gray-200 p-6">
        {deposit &&
          <>
            <h1 className={`text-lg mb-6 ${deposit.result === "success" ? "text-green-600" : ""}`}>Deposit Funds {deposit?.result === "success" ? "Succeeded" : "Failed"} </h1>
            {deposit.result === "failed" && deposit.reason && <div className="text-sm w-full p-4 border border-red-700 text-red-700 mb-6">Reason: {deposit.reason}</div>}
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-lg">Username: {deposit.username}</span>
              <span className="text-lg">Deposit Amount: ${deposit.depositAmount}</span>
              <span className="text-lg">Sender: <br /> <code className="text-sm">{deposit.sender}</code></span>
              <span className="text-lg">Dedicated address:  <br /><code className="text-sm">{deposit.dedicatedWallet}</code></span>
              <span className="text-lg">Transaction:  <br /><code className="text-sm">{deposit.tx}</code></span>
            </div>
          </>
        }
      </div>
    </div >
  )
}
