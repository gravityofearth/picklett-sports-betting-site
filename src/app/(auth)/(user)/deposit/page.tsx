"use client"

import type React from "react"
import { Suspense, useEffect, useState } from "react"
import { showToast, validateEthAddress } from "@/utils"
import axios, { AxiosError } from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/store"
import { DepositType, RedemptionType } from "@/types"
import DepositTable from "@/components/DepositTable"
import SumCard from "@/components/SumCard"

function DepositPage() {
  const { setToken, username } = useUser()
  const [deposits, setDeposits] = useState<DepositType[]>([])
  useEffect(() => {
    if (!localStorage.getItem("jwt")) return
    axios.get("/api/deposit", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { deposit } }) => {
        setDeposits(deposit)
      })
  }, [])
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
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Deposit Funds</h1>
          <p className="text-[#99A1AF]">If you would like to deposit other game currency like old school runescape GP, please open a ticket on discord</p>
        </div>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
          <div className="p-8 bg-linear-to-r from-[#0F172B80] to-[#1D293D4D] border border-[#31415880] rounded-[10px] flex flex-col gap-8">
            <div className="flex gap-2 items-center">
              <svg className="w-6 h-6"><use href="#svg-dollar-blue" /></svg>
              <h2 className="text-xl">Deposit Funds</h2>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label htmlFor="senderAddress" className="text-sm text-[#D1D5DC] block">Your Ethereum Address
                  <span className="text-[#FF6467]"> (Only Ethereum address is allowed!)</span>
                </label>
                <input
                  id="senderAddress"
                  type="text"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value.trim())}
                  className="w-full p-2 border border-[#E5E5E5] bg-[#1E2939] rounded-lg text-sm"
                  placeholder="0x..."
                />
                <div className="flex gap-2 items-center">
                  <svg className="w-4 h-4"><use href="#svg-i" /></svg>
                  <p className="text-sm text-[#99A1AF]">Network: Ethereum Mainnet</p>
                </div>
              </div>
              <button onClick={handleSender} className="w-full py-4 max-md:py-2 bg-[#01A3DB] hover:bg-[#45bce4] cursor-pointer disabled:cursor-not-allowed border border-[#364153] rounded-[10px] font-semibold" disabled={sendingRequest}>
                Continue
              </button>
            </div>
          </div>
          <div className="p-8 bg-linear-to-r from-[#0F172B80] to-[#1D293D4D] border border-[#31415880] rounded-[10px] flex flex-col gap-8">
            <div className="flex gap-2 items-center">
              <svg className="w-6 h-6"><use href="#svg-redeem" /></svg>
              <h2 className="text-xl">Redeem</h2>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[#99A1AF]">Enter your redemption code here to add funds to your account</p>
                <label htmlFor="redemption" className="text-sm text-[#D1D5DC] block">Redemption code</label>
                <input
                  id="redemption"
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.trim())}
                  className="w-full p-2 border border-[#E5E5E5] bg-[#1E2939] rounded-lg text-sm"
                  placeholder="Enter redemption code"
                />
              </div>
              <button onClick={handleRedeem} className="w-full py-4 max-md:py-2 bg-[#01A3DB] hover:bg-[#45bce4] cursor-pointer disabled:cursor-not-allowed border border-[#364153] rounded-[10px] font-semibold" disabled={sendingRequest}>
                Redeem
              </button>
              {redemption?.status === "redeemed" &&
                <div className="flex gap-4 py-2 px-4 border border-[#2afe0033] bg-linear-to-r from-[#2afe001a] to-[#4eca351a] rounded-lg text-[#2afe00]">
                  Successfully redeemed ${redemption.amount}
                </div>
              }
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-3 max-md:grid-cols-1 gap-6">
          <SumCard icon="redeem" amount={deposits.filter(v => v.result === "success").length.toString()} heading="Success" description="Completed withdrawals" color="#00D492" />
          <SumCard icon="pending" amount={deposits.filter(v => v.result === "initiated").length.toString()} heading="Pending" description="Processing withdrawals" color="#FFBA00" />
          <SumCard icon="failed" amount={deposits.filter(v => v.result === "failed").length.toString()} heading="Fail" description="Unsuccessful attempts" color="#FF6467" />
        </div>
        {username && <DepositTable userDeposits={deposits} username={username} />}
      </div>
    </div>
  )
}
export default function Home() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) return null;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DepositPage />
    </Suspense>)
}