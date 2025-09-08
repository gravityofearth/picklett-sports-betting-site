"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
    <div className="flex justify-center">
      <div className="w-full max-w-md flex flex-col items-center gap-6 border border-[#6e7b99] p-6 rounded-[10px]">
        {deposit &&
          <>
            <h1 className={`text-xl font-semibold  ${deposit.result === "success" ? "text-[#05DF72]" : ""}`}>Deposit Funds {deposit?.result === "success" ? "Succeeded" : "Failed"} </h1>
            {deposit.result === "failed" && deposit.reason &&
              <div className="w-full flex gap-4 p-4 text-sm border border-[#FF6467] bg-linear-to-r from-[#ff64672d] to-[#ff64674d] rounded-lg text-[#FF6467]">Reason: {deposit.reason}</div>
            }
            <div className="flex flex-col gap-2 text-sm">
              <span>Username: {deposit.username}</span>
              {deposit.depositAmount > 0 && <span>Deposit Amount: ${deposit.depositAmount}</span>}
              <span>Sender: <br /> <code className="text-sm text-[#99A1AF] break-all">{deposit.sender}</code></span>
              <span>Dedicated address:  <br /><code className="text-sm text-[#99A1AF] break-all">{deposit.dedicatedWallet}</code></span>
              <span>Transaction:  <br /><code className="text-sm text-[#99A1AF] break-all">{deposit.tx}</code></span>
            </div>
          </>
        }
      </div>
    </div >
  )
}
