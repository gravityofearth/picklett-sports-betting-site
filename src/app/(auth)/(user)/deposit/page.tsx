"use client"

import type React from "react"
import { useState } from "react"
import { showToast, validateEthAddress } from "@/utils"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"
export default function DepositPage() {
  const [senderAddress, setSenderAddress] = useState("")
  const [sendingRequest, setSendingRequest] = useState(false)
  const router = useRouter()
  const handleSender = () => {
    if (!validateEthAddress(senderAddress)) {
      showToast("Enter address correctly!", "warn")
      return
    }
    setSendingRequest(true)
    axios.post("/api/deposit/initiate", {
      sender: senderAddress,
    }, { headers: { token: localStorage.getItem("jwt") } }).then(({ status, data: { deposit } }) => {
      if (status === 201) {
        router.push(`/deposit/${deposit._id}`)
      }
    }).catch((e: AxiosError) => {
      showToast(e.response?.statusText || "Unknown Error", "error")
    }).finally(() => setSendingRequest(false))
  }

  return (
    <div className="max-w-lg w-full mx-auto p-4">
      <div className="flex flex-col gap-6 border border-gray-200 p-6">
        <div className="flex gap-2 items-center">
          <h1 className="text-lg">Deposit Funds</h1>
          <Image alt="eth-logo" src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" width={28} height={28} />
          <Image alt="usdt-logo" src="https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" width={28} height={28} />
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
          <button onClick={handleSender} className="w-full p-2 text-white bg-black hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
            Continue
          </button>
        </div>
      </div>
    </div >
  )
}
