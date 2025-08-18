"use client"
import { WithdrawType } from "@/types"
import { showToast, validateEthTx } from "@/utils"
import axios, { AxiosError } from "axios"
import Link from "next/link"
import { useParams } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
export default function WithdrawPage() {
  const [withdraw, setWithdraw] = useState<WithdrawType | null>(null)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [approveReject, setApproveReject] = useState<"approve" | "reject" | null>(null)
  const [tx, setTx] = useState("")
  const [reason, setReason] = useState("")
  const params = useParams();
  useEffect(() => {
    axios.get(`/api/withdraw/${params.withdrawId}`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => setWithdraw(withdraw))
  }, [])
  const submitApprove = () => {
    if (!withdraw) return
    if (!tx || tx.trim() === "") {
      showToast("Enter transaction ID correctly", "warn")
      return
    }
    if (!validateEthTx(tx.trim())) {
      showToast("Invalid transaction ID", "warn")
      return
    }
    if (!withdraw.userbalance || withdraw.amount > withdraw.userbalance) {
      showToast("Insufficient user balance for withdrawl", "error")
      return
    }
    setSendingRequest(true)
    axios.post("/api/withdraw/approve", { id: withdraw._id, tx: tx.trim(), }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => {
        setWithdraw(withdraw)
        showToast("You approved this withdrawl request", "success")
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
        showToast("You rejected this withdrawl request", "info")
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
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-lg">Username: {withdraw.username}</span>
              {withdraw.userbalance && <span className="text-lg">User account balance: ${withdraw.userbalance.toFixed(2)}</span>}
              <span className="text-lg">Withdraw Amount: ${withdraw.amount}</span>
              <span className="text-lg">Wallet Address: <code className="text-sm break-all">{withdraw.wallet}</code></span>
              <span className="text-lg">Status: {withdraw.result}</span>
            </div>
            {
              withdraw.result === "requested" &&
              <div className="flex gap-4">
                <button onClick={() => setApproveReject("approve")} className={`p-4 border border-gray-300 w-full flex justify-center hover:bg-gray-200 cursor-pointer ${approveReject === "approve" ? "bg-gray-200" : ""}`}>
                  Approve
                </button>
                <button onClick={() => setApproveReject("reject")} className={`p-4 border border-gray-300 w-full flex justify-center hover:bg-gray-200 cursor-pointer ${approveReject === "reject" ? "bg-gray-200" : ""}`}>
                  Reject
                </button>
              </div>
            }
            {approveReject === "approve" && withdraw.result === "requested" &&
              <div className="pt-4">
                <div className="mb-4">
                  <label className="block mb-2 text-sm">
                    Enter withdraw transaction ID here
                  </label>
                  <input
                    type="text"
                    value={tx}
                    onChange={(e) => setTx(e.target.value.trim())}
                    className="w-full p-2 border border-gray-300"
                    placeholder="0x..."
                  />
                </div>
                <button onClick={submitApprove} className="p-4 bg-black text-white border border-gray-300 w-full flex justify-center hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
                  Submit
                </button>
              </div>
            }
            {approveReject === "reject" && withdraw.result === "requested" &&
              <div className="pt-4">
                <div className="mb-4">
                  <label className="block mb-2 text-sm">
                    Enter why you rejected this withdrawl request
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border border-gray-300"
                    placeholder="e.g. Insufficient balance"
                  />
                </div>
                <button onClick={submitReject} className="p-4 bg-black text-white border border-gray-300 w-full flex justify-center hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
                  Submit
                </button>
              </div>
            }
          </>
        }
      </div>
    </div >
  )
}
