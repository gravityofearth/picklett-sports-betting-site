"use client"

import type React from "react"

import jwt from "jsonwebtoken"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DepositPage() {
  const [username, setUsername] = useState("")
  const [senderAddress, setSenderAddress] = useState("")
  const [txid, setTxid] = useState("")
  const [message, setMessage] = useState({ text: "", type: "" })
  const [step, setStep] = useState(1) // Step 1: Enter sender address, Step 2: Show deposit address and TXID field
  const router = useRouter()
  const walletAddress = "0x1234567890abcdef1234567890abcdef12345678"

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
    if (!storedUsername) {
      router?.push("/login")
      return
    }
    setUsername(storedUsername)
  }, [router])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    setMessage({ text: "Address copied to clipboard", type: "success" })
    setTimeout(() => setMessage({ text: "", type: "" }), 3000)
  }

  const handleSenderAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!senderAddress.trim()) {
      setMessage({ text: "Please enter your sender address", type: "error" })
      return
    }

    // Validate the address format (basic check for Ethereum address)
    if (!senderAddress.startsWith("0x") || senderAddress.length !== 42) {
      setMessage({ text: "Please enter a valid Ethereum address", type: "error" })
      return
    }

    // Move to step 2
    setMessage({ text: "", type: "" })
    setStep(2)
  }

  const verifyDeposit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!txid.trim()) {
      setMessage({ text: "Please enter a transaction ID", type: "error" })
      return
    }

    // In a real app, you'd verify the transaction with your backend
    // This is just a simulation
    if (txid.length < 10) {
      setMessage({ text: "Invalid transaction ID", type: "error" })
    } else {
      setMessage({ text: "Deposit verified successfully! Balance updated.", type: "success" })
      setTxid("")
      // Reset to step 1 for a new deposit
      setTimeout(() => {
        setStep(1)
        setSenderAddress("")
      }, 3000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => router.push("/home")} className="mb-4 px-4 py-2 border border-gray-300">
        Back to Home
      </button>

      <div className="border border-gray-200 p-6">
        <h1 className="text-lg mb-6">Deposit Funds</h1>

        {step === 1 ? (
          <>
            <p className="mb-4">Please enter the address you will be sending funds from:</p>
            <form onSubmit={handleSenderAddressSubmit}>
              <div className="mb-4">
                <label htmlFor="senderAddress" className="block mb-2 text-sm">
                  Your Sender Address
                </label>
                <input
                  id="senderAddress"
                  type="text"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300"
                  placeholder="0x..."
                />
              </div>

              <button type="submit" className="w-full p-2 text-white bg-black">
                Continue
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6">
              <p className="mb-2">Send ETH to this address:</p>
              <div className="flex items-center">
                <code className="flex-1 p-2 bg-gray-100 font-mono text-sm overflow-x-auto">{walletAddress}</code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 ml-2 border border-gray-300"
                  aria-label="Copy to clipboard"
                >
                  Clipboard
                </button>
              </div>
            </div>

            <p className="mb-4">
              Send ETH from your address {senderAddress} to the address above. Paste your TXID below after sending.
            </p>

            <form onSubmit={verifyDeposit}>
              <div className="mb-4">
                <label htmlFor="txid" className="block mb-2 text-sm">
                  Transaction ID (TXID)
                </label>
                <input
                  id="txid"
                  type="text"
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  className="w-full p-2 border border-gray-300"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 p-2 border border-gray-300">
                  Back
                </button>
                <button type="submit" className="flex-1 p-2 text-white bg-black">
                  Verify Deposit
                </button>
              </div>
            </form>
          </>
        )}

        {message.text && (
          <div className={`mt-4 p-2 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
