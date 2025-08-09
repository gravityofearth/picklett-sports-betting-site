"use client"

import type React from "react"

import jwt from "jsonwebtoken"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { showToast, validateCurrency, validateEthAddress, validateEthTx } from "@/utils"
import axios, { AxiosError } from "axios"
import QRCodeImg from "@/components/QRCodeImg"
import { DepositType } from "@/types"
import betModel from "@/model/bet"
import { useParams, useRouter } from "next/navigation"
const svgCopy = () => <svg className="w-4 h-4"><use href="#svg-copy" /></svg>
const svgCopyOk = () => <svg className="w-4 h-4"><use href="#svg-copy-ok" /></svg>

export default function DepositPage() {
  const [tx, setTx] = useState("")
  const [disableButton, setDisableButton] = useState(false)
  const [copyContent, setCopyContent] = useState(svgCopy)
  const [deposit, setDeposit] = useState<DepositType | null>(null)
  const [coinType, setCoinType] = useState<"USDT" | "ETH" | null>(null)
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
          timeout = setTimeout(fetchDepositData, 5000)
        }
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
    if (!coinType) {
      showToast("Please choose whether you send ETH or USDT", "warn")
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
      coinType,
      tx,
    }).then(({ data: { deposit } }) => {
      setDeposit(deposit)
      timeout = setTimeout(fetchDepositData, 5000)
    }).finally(() => {
      setDisableButton(true)
    })
  }
  return (
    <div className="max-w-2xl mx-auto p-4">

      <Link href="/home" className="mb-4 px-4 py-2 border border-gray-300 block w-fit">Back to Home</Link>

      <div className="border border-gray-200 p-6">
        <h1 className="text-lg mb-6">Deposit Funds</h1>
        {deposit &&
          <>
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-lg">Your Deposit Amount is ${deposit.depositAmount}.</span>
              <span>Which token do you want to use to pay?</span>
              <div className="w-full flex gap-2">
                <button onClick={() => setCoinType("USDT")} className={`w-full p-3 border border-gray-300 cursor-pointer ${(deposit.coinType === "undefined" ? coinType : deposit.coinType) === "USDT" ? "bg-black/70 text-white" : "hover:bg-black/20"} disabled:cursor-not-allowed`} disabled={deposit.coinType !== "undefined"}>
                  Pay with USDT ({deposit.targetUSDT})
                </button>
                <button onClick={() => setCoinType("ETH")} className={`w-full p-3 border border-gray-300 cursor-pointer ${(deposit.coinType === "undefined" ? coinType : deposit.coinType) === "ETH" ? "bg-black/70 text-white" : "hover:bg-black/20"} disabled:cursor-not-allowed`} disabled={deposit.coinType !== "undefined"}>
                  Pay with ETH ({deposit.targetETH})
                </button>
              </div>
            </div>
            <div className="my-6">
              <p className="mb-2">
                {deposit.coinType === "undefined" ? <span> Send </span> : <span> Sent </span>}
                {(coinType || deposit.coinType !== "undefined") &&
                  <button disabled={deposit.coinType !== "undefined"} onClick={() => {
                    navigator.clipboard.writeText(`${coinType === "USDT" ? deposit.targetUSDT : deposit.targetETH}`)
                      .then(() => showToast(`Copied ${coinType === "USDT" ? deposit.targetUSDT : deposit.targetETH} to clipboard`, "info"))
                  }} >
                    <code className="flex-1 px-2 py-1 rounded-md bg-gray-200 font-mono text-xl overflow-x-auto cursor-pointer text-green-600">
                      {(deposit.coinType === "undefined" ? coinType : deposit.coinType) === "USDT" ? deposit.targetUSDT : deposit.targetETH}
                    </code>
                  </button>
                }
                <span> {deposit.coinType === "undefined" ? coinType : deposit.coinType}</span>
                {deposit.coinType === "undefined" ?
                  <>
                    <span> to following address within </span>
                    <span className="text-xl">{remainingTime}</span>
                  </> :
                  <span>, now verifying...</span>
                }
              </p>
              <div className="w-full flex justify-center"><QRCodeImg className="w-32 h-32" value={deposit.dedicatedWallet} /></div>
              <div className="flex items-center">
                <code onClick={() => copyToClipboard(deposit.dedicatedWallet)} className="flex-1 p-2 bg-gray-100 font-mono text-sm overflow-x-auto">
                  {deposit.dedicatedWallet}
                </code>
                <button onClick={() => copyToClipboard(deposit.dedicatedWallet)} className="p-2 ml-2 border border-gray-300 cursor-pointer rounded-md">
                  {copyContent}
                </button>
              </div>
            </div>
            <div>
              <div className="my-4">
                <label htmlFor="txid" className="block mb-2 text-sm">
                  Transaction ID (TXID)
                </label>
                <input
                  id="txid"
                  type="text"
                  value={deposit.tx === "undefined" ? tx : deposit.tx}
                  disabled={deposit.tx !== "undefined"}
                  onChange={(e) => setTx(e.target.value)}
                  className="w-full p-2 border border-gray-300 disabled:text-gray-500 text-sm"
                  placeholder="0x..."
                />
              </div>

              <div className="flex gap-2">
                <button onClick={handleVerify} className="flex-1 p-2 text-white bg-black cursor-pointer hover:bg-black/80 disabled:bg-black/50 disabled:cursor-not-allowed" disabled={disableButton}>
                  Verify Deposit
                </button>
              </div>
            </div>
          </>
        }
      </div>
    </div >
  )
}
