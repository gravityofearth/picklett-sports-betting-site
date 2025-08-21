"use client"

import type React from "react"
import { Suspense, useEffect, useState } from "react"
import { showToast, validateEthAddress } from "@/utils"
import axios, { AxiosError } from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useUser } from "@/store"
import { RedemptionType } from "@/types"
function DepositPage() {
  const { setToken } = useUser()
  const [redemption, setRedemption] = useState<RedemptionType | null>(null)
  const [senderAddress, setSenderAddress] = useState("")
  const [sendingRequest, setSendingRequest] = useState(false)
  const [redeemCode, setRedeemCode] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  useEffect(() => {
    const redeem = searchParams.get('redeem')
    if (redeem && redeem.trim() !== "") {
      setRedeemCode(redeem)
    }
  }, [searchParams])
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
  const handleRedeem = () => {
    if (redeemCode.trim() === "") {
      showToast("Enter redemption code", "warn")
      return
    }
    setSendingRequest(true)
    axios.post(`/api/redemption/redeem`, { code: redeemCode.trim() }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { redemption, token } }) => {
        setRedemption(redemption)
        setToken(token)
        setRedeemCode("")
      })
      .catch((e: AxiosError) => {
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
      <div className="flex flex-col gap-6 border border-gray-200 p-6 mt-6">
        <h1 className="text-lg">Redeem your redemption code here</h1>
        <div className="flex justify-center items-end gap-4">
          <div className="w-full">
            <label htmlFor="redemption" className="block mb-2 text-sm">
              Redemption code
            </label>
            <input
              id="redemption"
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.trim())}
              className="w-full h-10 p-2 border border-gray-300"
              placeholder="Enter redemption code"
            />
          </div>
          <button onClick={handleRedeem} className="w-full p-2 text-white bg-black hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
            Redeem
          </button>
        </div>
        {redemption?.status === "redeemed" &&
          <div className="p-6 border border-green-500 text-sm text-green-700 bg-green-100">
            Successfully redeemed ${redemption.amount}
          </div>
        }
      </div>
    </div >
  )
}
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DepositPage />
    </Suspense>)
}