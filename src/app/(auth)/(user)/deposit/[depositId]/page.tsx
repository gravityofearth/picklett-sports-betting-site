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
    <div className="max-w-2xl mx-auto p-4">

      <div className="border border-gray-200 p-6">
        <h1 className="text-lg mb-6">Deposit Funds</h1>
        {deposit &&
          <>
            {deposit.tx !== "undefined" && deposit.reason !== "" &&
              <div className="my-6 p-6 border border-yellow-500 text-sm text-yellow-700 bg-yellow-100">
                Transaction will be confirmed after 6 confirmations on blockchain. <br /> Please wait... {deposit.reason}
              </div>
            }
            <div className="my-6">
              <p className="mb-2">
                {deposit.tx === "undefined" ? <span> Send ETH or USDT </span> : <span> Sent </span>}

                {deposit.tx === "undefined" ?
                  <>
                    <span> to following address within </span>
                    <span className="text-xl">{remainingTime}</span>
                  </> :
                  <span>. Verifying transaction...</span>
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
              <div className="py-6 text-sm text-yellow-700 italic">
                * When you send ETH, your deposit amount may differ slightly due to changes in ETH's price.
              </div>
            </div>
          </>
        }
      </div>
    </div >
  )
}
