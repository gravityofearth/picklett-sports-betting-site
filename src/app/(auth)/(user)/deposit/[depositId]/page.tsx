"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { showToast, validateEthTx } from "@/utils"
import axios, { AxiosError } from "axios"
import QRCodeImg from "@/components/QRCodeImg"
import { DepositType } from "@/types"
import { useParams, useRouter } from "next/navigation"
import { svgCopy, svgCopyOk } from "@/components/SVG"

export default function DepositPage() {
  const [tx, setTx] = useState("")
  const [disableButton, setDisableButton] = useState(false)
  const [copyContent, setCopyContent] = useState(svgCopy)
  const [deposit, setDeposit] = useState<DepositType | null>(null)
  const [remainingTime, setRemainingTime] = useState("")
  const [timeOffset, setTimeOffset] = useState(0)
  const router = useRouter()
  const params = useParams();
  let timeout: NodeJS.Timeout | null = null;
  const fetchDepositData = () => {
    console.log("polling result...")
    axios.get(`/api/deposit/${params.depositId}`)
      .then(({ data: { deposit, basets } }) => {
        setDeposit(deposit)
        setTimeOffset(new Date().getTime() - basets)
        if (deposit.result === "verifying") {
          timeout = setTimeout(fetchDepositData, 12000)
        }
      }).catch((e: AxiosError) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      })
  }
  useEffect(() => {
    fetchDepositData()
    return () => clearTimeout(timeout!!)
  }, [])
  useEffect(() => {
    if (!deposit) return
    if (deposit.result !== "initiated") setDisableButton(true)
    if (deposit.result === "success" || deposit.result === "failed") {
      router.push(`/deposit/${params.depositId}/result`)
      return
    }
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date(deposit.createdAt).getTime() + 10 * 60 * 1000 + timeOffset - new Date().getTime()) / 1000)
      if (seconds > 0) {
        setRemainingTime(`${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`)
      } else {
        setRemainingTime("00:00")
        setDisableButton(true)
      }
    }, 1000);
    return () => clearInterval(interval)
  }, [deposit])
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyContent(svgCopyOk)
      setTimeout(() => setCopyContent(svgCopy), 500);
    } catch (error) {
    }
  }
  const handleVerify = () => {
    if (!deposit) return
    const seconds = Math.floor((new Date(deposit.createdAt).getTime() + 10 * 60 * 1000 + timeOffset - new Date().getTime()) / 1000)
    if (seconds < 0) {
      showToast("Your deposit quote is already expired", "warn")
      return
    }
    if (!tx || tx.trim() === "") {
      showToast("Enter transaction ID correctly", "warn")
      return
    }
    if (!validateEthTx(tx.trim())) {
      showToast("Invalid transaction ID", "warn")
      return
    }
    setDisableButton(true)
    axios.post("/api/deposit/verify", {
      id: deposit._id,
      tx,
    }).then(({ data: { deposit } }) => {
      setDeposit(deposit)
      timeout = setTimeout(fetchDepositData, 5000)
    }).catch((e: AxiosError) => {
      showToast(e.response?.statusText || "Unknown Error", "error")
    }).finally(() => {
      setDisableButton(true)
    })
  }
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md flex flex-col items-center gap-6 border border-[#6e7b99] p-6 rounded-[10px]">
        <h1 className="text-xl font-semibold">Deposit Funds</h1>
        {deposit &&
          <>
            {deposit.tx !== "undefined" && deposit.reason !== "" &&
              <div className="w-full flex gap-4 p-4 text-sm border border-[#FE9A0033] bg-linear-to-r from-[#FE9A001A] to-[#FF69001A] rounded-lg text-[#FFB900]">
                Transaction will be confirmed after 6 confirmations on blockchain. <br /> Please wait... {deposit.reason}
              </div>
            }
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 items-center">
                {deposit.tx === "undefined" ?
                  <div className="flex flex-col items-center">
                    <span> Send ETH or USDT to following address within </span>
                    <span className="text-[#FF7076] font-semibold">{remainingTime}</span>
                  </div> :
                  <div> Sent. Verifying transaction... </div>
                }
                <div className="w-full flex justify-center"><QRCodeImg className="w-32 h-32" value={deposit.dedicatedWallet} /></div>
                <div className="flex items-center w-full bg-[#1E293999] border border-[#E5E5E566] rounded-lg">
                  <code onClick={() => copyToClipboard(deposit.dedicatedWallet)} className="flex-1 p-2 cursor-pointer font-mono text-sm overflow-x-auto break-all">
                    {deposit.dedicatedWallet}
                  </code>
                  <button onClick={() => copyToClipboard(deposit.dedicatedWallet)} className="p-2 cursor-pointer rounded-lg">
                    {copyContent}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="txid" className="block text-sm font-semibold">
                  Transaction ID (TXID)
                </label>
                <input
                  id="txid"
                  type="text"
                  value={deposit.tx === "undefined" ? tx : deposit.tx}
                  disabled={deposit.tx !== "undefined"}
                  onChange={(e) => setTx(e.target.value)}
                  className="w-full p-2 border border-[#E5E5E566] rounded-lg disabled:text-[#E5E5E566] text-sm"
                  placeholder="0x..."
                />
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={handleVerify} className="w-full py-2 bg-[#01A3DB] hover:bg-[#45bce4] cursor-pointer disabled:cursor-not-allowed border border-[#364153] rounded-[10px] text-sm font-semibold" disabled={disableButton}>
                  Verify Deposit
                </button>
                <div className="text-xs text-[#FCC800]">
                  * When you send ETH, your deposit amount may differ slightly due to changes in ETH's price.
                </div>
              </div>
            </div>
          </>
        }
      </div>
    </div>
  )
}
