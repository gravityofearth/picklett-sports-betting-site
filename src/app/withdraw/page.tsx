"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WithdrawPage() {
  const [username, setUsername] = useState("")
  const [balance, setBalance] = useState(1000.0) // Mock balance
  const [walletAddress, setWalletAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState({ text: "", type: "" })
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem("username")
    if (!storedUsername) {
      router.push("/login")
      return
    }
    setUsername(storedUsername)
  }, [router])

  const requestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = Number.parseFloat(amount)

    if (!walletAddress.trim()) {
      setMessage({ text: "Please enter a wallet address", type: "error" })
      return
    }

    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > balance) {
      setMessage({ text: "Please enter a valid amount", type: "error" })
      return
    }

    // In a real app, you'd send this to your backend
    // This is just a simulation
    setMessage({ text: "Withdrawal request submitted successfully", type: "success" })
    setWalletAddress("")
    setAmount("")
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => router.push("/home")} className="mb-4 px-4 py-2 border border-gray-300">
        Back to Home
      </button>

      <div className="border border-gray-200 p-6">
        <h1 className="text-lg mb-6">Withdraw Funds</h1>

        <div className="mb-6">
          <p>Current Balance: ${balance.toFixed(2)}</p>
        </div>

        <form onSubmit={requestWithdrawal}>
          <div className="mb-4">
            <label htmlFor="walletAddress" className="block mb-2 text-sm">
              Your Wallet Address
            </label>
            <input
              id="walletAddress"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full p-2 border border-gray-300"
              placeholder="0x..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="amount" className="block mb-2 text-sm">
              Amount to Withdraw
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300"
              min="1"
              max={balance}
              step="0.01"
            />
          </div>

          <button type="submit" className="w-full p-2 text-white bg-black">
            Request Withdrawal
          </button>
        </form>

        {message.text && (
          <div className={`mt-4 p-2 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">Withdrawals are processed manually within 24h.</p>
      </div>
    </div>
  )
}
