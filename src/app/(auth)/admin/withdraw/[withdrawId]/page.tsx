"use client"

import { CircularIndeterminate } from "@/components/Circular"
import { WithdrawType } from "@/types"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { useParams, useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"

export default function WithdrawPage() {
  const [withdraw, setWithdraw] = useState<WithdrawType | null>(null)
  const [vaultBalance, setVaultBalance] = useState<number>(0)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [approveReject, setApproveReject] = useState<"approve" | "reject" | null>(null)
  const [reason, setReason] = useState("")
  const params = useParams();
  const router = useRouter()
  useEffect(() => {
    axios.get(`/api/withdraw/${params.withdrawId}`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw, lockedPrice, vaultBalance } }) => {
        setWithdraw(withdraw)
        if (withdraw.network === "Bitcoin") {
          setVaultBalance(Math.ceil(vaultBalance * lockedPrice / 10 ** 8 * 100) / 100)
        }
      })
  }, [])
  const submitApprove = () => {
    if (!withdraw) return
    if (!withdraw.userbalance || withdraw.amount > withdraw.userbalance) {
      showToast("Insufficient user balance for withdrawal", "error")
      return
    }
    setSendingRequest(true)
    axios.post("/api/withdraw/approve", { id: withdraw._id }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => {
        setWithdraw(withdraw)
        showToast("You approved this withdrawal request", "success")
        router.push(`./`)
      }).catch((e: AxiosError) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      })
      .finally(() => {
        setSendingRequest(false)
      })
  }
  const submitReject = () => {
    if (!withdraw) return
    if (reason.trim() === "") {
      showToast("Please describe the reason why you rejected", "warn")
      return
    }
    setSendingRequest(true)
    axios.post("/api/withdraw/reject", { id: withdraw._id, reason: reason.trim() }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => {
        setWithdraw(withdraw)
        showToast("You rejected this withdrawal request", "info")
        router.push(`./`)
      })
      .finally(() => {
        setSendingRequest(false)
      })
  }
  return (
    <div className="max-w-2xl w-full mx-auto p-4">
      <div className="border border-gray-200 p-6">
        {withdraw &&
          <>
            <div className="flex flex-col gap-2 text-sm mb-4">
              <span className="text-lg">Current Vault Balance: ${vaultBalance}</span>
              <span className="text-lg">Username: {withdraw.username}</span>
              {withdraw.result === "pending" && withdraw.userbalance && withdraw.userbalance > 0 ? <span className="text-lg">User account balance: ${withdraw.userbalance.toFixed(2)}</span> : <></>}
              <span className="text-lg">Withdraw Currency: {withdraw.currency}</span>
              <span className="text-lg">Withdraw Network: {withdraw.network}</span>
              <span className="text-lg">Withdraw Amount: ${withdraw.amount}</span>
              <span className="text-lg">Status: {withdraw.result}</span>
              {/* <span className="text-lg">{withdraw.address ? "Wallet Address: " : "Requested through gamecurrency"}<code className="text-sm break-all">{withdraw.address}</code></span> */}
              {withdraw.result !== "success" && withdraw.reason && <span className="text-lg">Reason: {withdraw.reason}</span>}
            </div>
            {
              withdraw.result === "pending" &&
              <div className="flex gap-4">
                <button onClick={() => setApproveReject("approve")} disabled={vaultBalance < withdraw.amount} className={`p-4 border border-gray-300 w-full flex justify-center hover:bg-gray-200 hover:text-[black] cursor-pointer disabled:cursor-not-allowed ${approveReject === "approve" ? "bg-gray-200 text-[black]" : ""}`}>
                  Approve
                </button>
                <button onClick={() => setApproveReject("reject")} className={`p-4 border border-gray-300 w-full flex justify-center hover:bg-gray-200 hover:text-[black] cursor-pointer ${approveReject === "reject" ? "bg-gray-200 text-[black]" : ""}`}>
                  Reject
                </button>
              </div>
            }
            {approveReject === "approve" && withdraw.result === "pending" &&
              <div className="pt-4">
                {sendingRequest ?
                  <div className="w-full flex justify-center"><CircularIndeterminate /></div> :
                  <button onClick={submitApprove} className="p-4 bg-black text-white border border-gray-300 w-full flex justify-center hover:bg-white/20 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
                    Confirm
                  </button>
                }
              </div>
            }
            {approveReject === "reject" && withdraw.result === "pending" &&
              <div className="pt-4">
                <div className="mb-4">
                  <label className="block mb-2 text-sm">
                    Enter why you rejected this withdrawal request
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border border-gray-300"
                    placeholder="e.g. Insufficient balance"
                  />
                </div>
                {sendingRequest ?
                  <div className="w-full flex justify-center"><CircularIndeterminate /></div> :
                  <button onClick={submitReject} className="p-4 bg-black text-white border border-gray-300 w-full flex justify-center hover:bg-white/20 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
                    Submit
                  </button>
                }
              </div>
            }
          </>
        }
      </div>
    </div >
  )
}
