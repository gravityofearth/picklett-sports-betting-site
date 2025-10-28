"use client"
import { Suspense, useEffect, useState } from "react"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { useSearchParams } from "next/navigation"
import { useUser } from "@/store"
import { RedemptionType } from "@/types"

function Redemption() {
  const { setToken } = useUser()
  const [redemption, setRedemption] = useState<RedemptionType | null>(null)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [redeemCode, setRedeemCode] = useState("")
  const searchParams = useSearchParams()
  useEffect(() => {
    const redeem = searchParams.get('redeem')
    if (redeem && redeem.trim() !== "") {
      setRedeemCode(redeem)
    }
  }, [searchParams])
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
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Redemption</h1>
          <p className="text-[#99A1AF]">You can get redeem. Please paste redemption code here!</p>
        </div>
        <div className="flex flex-col gap-6 w-full items-center">
          <div className="w-fit p-8 bg-linear-to-r from-[#0F172B80] to-[#1D293D4D] border border-[#31415880] rounded-[10px] flex flex-col gap-8">
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
      </div>
    </div>
  )
}
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Redemption />
    </Suspense>)
}