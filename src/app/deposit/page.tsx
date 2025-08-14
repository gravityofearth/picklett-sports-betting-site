"use client"

import type React from "react"

import jwt from "jsonwebtoken"
import { useState, useEffect } from "react"
import Link from "next/link"
import { showToast, validateCurrency, validateEthAddress } from "@/utils"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"
export default function DepositPage() {
  const [senderAddress, setSenderAddress] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [sendingRequest, setSendingRequest] = useState(false)
  const router = useRouter()
  const handleSender = () => {
    if (!validateEthAddress(senderAddress)) {
      showToast("Enter address correctly!", "warn")
      return
    }
    if (!Number(depositAmount)) {
      showToast("Enter number correctly!", "warn")
      return
    }
    if (Number(depositAmount) < 5) {
      showToast("Minimum deposit amount is $5", "warn")
      return
    }
    setSendingRequest(true)
    axios.post("/api/deposit/initiate", {
      sender: senderAddress,
      depositAmount: Number(depositAmount),
    }, {
      headers: { token: localStorage.getItem("jwt") }
    }).then(({ status, data: { deposit } }) => {
      if (status === 201) {
        router.push(`/deposit/${deposit._id}`)
      }
    }).catch((e: AxiosError) => {
      showToast(e.response?.statusText || "Unknown Error", "error")
    }).finally(() => setSendingRequest(false))
  }

  useEffect(() => {
    const storedUsername = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
    if (!storedUsername) {
      router?.push("/login")
      return
    }
  }, [])
  return (
    <div className="max-w-2xl mx-auto p-4">

      <Link href="/home" className="mb-4 px-4 py-2 border border-gray-300 block w-fit">Back to Home</Link>

      <div className="flex flex-col gap-6 border border-gray-200 p-6">
        <div className="flex gap-2 items-center">
          <h1 className="text-lg">Deposit Funds</h1>
          <Image alt="eth-logo" src="/Ethericon.png" width={28} height={28} />
          <Image alt="usdt-logo" src="/USDTicon.png" width={28} height={28} />
        </div>
        <div>
          <div className="mb-4">
            <label htmlFor="senderAddress" className="block mb-2 text-sm">
              Your Sender Address (<span className="text-red-700">Only Ethereum address is allowed!</span>)
            </label>
            <input
              id="senderAddress"
              type="text"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value.trim())}
              className="w-full p-2 border border-gray-300"
              placeholder="0x..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="depositAmount" className="block mb-2 text-sm">
              Deposit Amount (<span className="text-red-700">Minimum deposit amount: $5</span>)
            </label>
            <div className="flex items-center border border-gray-300 p-2">
              <span className="text-3xl">$</span>
              <input
                id="depositAmount"
                type="text"
                value={depositAmount}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === "" || validateCurrency(v)) {
                    setDepositAmount(v)
                  } else if (v === ".") {
                    setDepositAmount("0.")
                  }

                }}
                className="w-full px-2 border border-gray-300 text-3xl border-none outline-none"
                placeholder="0.00"
              />

            </div>
          </div>
          <button onClick={handleSender} className="w-full p-2 text-white bg-black hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
            Continue
          </button>
        </div>
      </div>
    </div >
  )
}
