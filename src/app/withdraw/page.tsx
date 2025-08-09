"use client"

import type React from "react"

import jwt from "jsonwebtoken"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { showToast, validateCurrency, validateEthAddress } from "@/utils"
import axios, { AxiosError } from "axios"
import WithdrawTable from "@/components/WithdrawTable"
import { WithdrawType } from "@/types"

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0)
  const [username, setUsername] = useState("")
  const [wallet, setWallet] = useState("")
  const [amount, setAmount] = useState("")
  const [sendingRequest, setSendingRequest] = useState(false)
  const [withdraws, setWithdraws] = useState<WithdrawType[]>([])
  const router = useRouter()

  useEffect(() => {
    const storedUsername = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
    if (!storedUsername) {
      router?.push("/login")
      return
    }
    setUsername(storedUsername)
    setBalance((jwt.decode(localStorage.getItem("jwt")!) as any)?.balance || 0)
    axios.get("/api/withdraw", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => {
        setWithdraws(withdraw)
      })
  }, [])
  const handleWithdraw = () => {
    const withdrawAmount = Number.parseFloat(amount)
    if (!validateEthAddress(wallet)) {
      showToast("Enter address correctly!", "warn")
      return
    }
    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > balance) {
      showToast("Please enter a valid amount", "warn")
      return
    }
    setSendingRequest(true)
    axios.post("/api/withdraw", {
      wallet,
      amount: Number(amount),
    }, {
      headers: { token: localStorage.getItem("jwt") }
    }).then(({ status, data: { withdraw } }) => {
      if (status === 201) {
        setWithdraws(v => ([withdraw, ...v]))
        // router.push(`/withdraw/${withdraw._id}`)
      }
    }).catch((e: AxiosError) => {
      showToast(e.response?.statusText, "error")
    }).finally(() => setSendingRequest(false))
    showToast("Withdrawal request submitted successfully", "success")
    setWallet("")
    setAmount("")
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Link href="/home" className="mb-4 px-4 py-2 border border-gray-300 block w-fit">Back to Home</Link>

      <div className="border border-gray-200 p-6 mb-6">
        <h1 className="text-lg mb-6">Withdraw Funds</h1>

        <div className="mb-6">
          <p>Current Balance: ${balance.toFixed(2)}</p>
        </div>

        <div>
          <div className="mb-4">
            <label htmlFor="senderAddress" className="block mb-2 text-sm">
              Your Wallet Address
            </label>
            <input
              id="senderAddress"
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value.trim())}
              className="w-full p-2 border border-gray-300"
              placeholder="0x..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="depositAmount" className="block mb-2 text-sm">
              Withdraw Amount
            </label>
            <div className="flex items-center border border-gray-300 p-2">
              <span className="text-3xl">$</span>
              <input
                id="depositAmount"
                type="text"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === "" || validateCurrency(v)) {
                    setAmount(v)
                  } else if (v === ".") {
                    setAmount("0.")
                  }

                }}
                className="w-full px-2 border border-gray-300 text-3xl border-none outline-none"
                placeholder="0.00"
              />

            </div>
          </div>

          <button onClick={handleWithdraw} className="w-full p-2 text-white bg-black hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
            Request Withdrawal
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500">Withdrawals are processed manually within 24h.</p>
      </div>

      <WithdrawTable withdraws={withdraws} username={username} />
    </div>
  )
}
