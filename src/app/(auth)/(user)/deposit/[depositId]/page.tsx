"use client"
import { useEffect, useRef, useState } from "react"
import { CurrencyDict, validateDecimal } from "@/utils"
import axios from "axios"
import { svgCopy, svgCopyOk } from "@/components/SVG"
import QRCodeImg from "@/components/QRCodeImg"
import { CircularIndeterminate } from "@/components/MUIs"
import { useParams, useRouter } from "next/navigation"
import { DepositType } from "@/types"
import { useUser } from "@/store"
export default function DepositPage() {
  const [copyContent, setCopyContent] = useState(svgCopy)
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyContent(svgCopyOk)
      setTimeout(() => setCopyContent(svgCopy), 500);
    } catch (error) {
    }
  }
  const { setToken } = useUser()
  const router = useRouter()
  const params = useParams();
  const [deposit, setDeposit] = useState<DepositType>()
  const [prices, setPrices] = useState(["0", "0"])
  const [timeOffset, setTimeOffset] = useState(0)
  const [timesRemaining, setTimeRemaining] = useState("20:00")
  const depositRef = useRef(deposit);
  const timeOffsetRef = useRef(timeOffset);
  useEffect(() => {
    depositRef.current = deposit;
  }, [deposit]);
  useEffect(() => {
    timeOffsetRef.current = timeOffset;
  }, [timeOffset]);
  const tout_ref = useRef<NodeJS.Timeout>(null)
  useEffect(() => {
    const tout = setInterval(() => {
      if (!depositRef.current) return
      if (depositRef.current.result !== "initiated") return
      if (["success"].includes(depositRef.current.result)) {
        clearInterval(tout!)
        return
      }
      const seconds = Math.floor((timeOffsetRef.current - new Date().getTime()) / 1000)
      if (seconds > 0) {
        setTimeRemaining(`${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`)
      } else {
        setTimeRemaining("Expired")
        fetchDeposit()
        clearInterval(tout!)
      }
    }, 1000)
    return () => clearInterval(tout!)
  }, [])
  const fetchDeposit = () => {
    axios.get(`/api/deposit/${params.depositId}`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { deposit, basets, token } }: { data: { deposit: DepositType, basets: number, token?: string } }) => {
        setDeposit(deposit)
        setTimeOffset(deposit.expiresAt + new Date().getTime() - basets)
        setPrices(prev => prev[0] === "0" && prev[1] === "0" ? [deposit.lockedPrice.toString(), "1"] : prev)
        if (["initiated", "confirming"].includes(deposit.result)) {
          tout_ref.current = setTimeout(fetchDeposit, 2_000);
        }
        if (deposit.result === "success") {
          if (token) setToken(token)
        }
      })
  }
  useEffect(() => {
    fetchDeposit()
    return () => clearTimeout(tout_ref.current!)
  }, [])
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Deposit Funds</h1>
          <p className="text-[#99A1AF]">If you would like to deposit other game currency like old school runescape GP, please open a ticket on discord</p>
        </div>
        <div className="flex justify-center">
          <div className="w-md p-8 bg-linear-to-r from-[#0F172B80] to-[#1D293D4D] border border-[#31415880] rounded-[10px] flex flex-col gap-8">
            <div className="flex gap-2 items-center">
              <svg className="w-6 h-6"><use href="#svg-dollar-blue" /></svg>
              <h2 className="text-xl">Deposit Funds</h2>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex justify-center items-center p-2 border border-[#01A3DB]`}>1</div>
                <div className={`h-[2px] w-10 bg-[#01A3DB]`}></div>
                <div className={`w-10 h-10 rounded-full flex justify-center items-center p-2 border ${deposit?.result === "initiated" || deposit?.result === "confirming" ? "bg-[#01A3DB]" : ""} border-[#01A3DB]`}>2</div>
                <div className={`h-[2px] w-10 ${deposit?.result === "success" || deposit?.result === "expired" ? "bg-[#01A3DB]" : "bg-[#E5E5E566]"}`}></div>
                <div className={`w-10 h-10 rounded-full flex justify-center items-center p-2 border ${deposit?.result === "success" || deposit?.result === "expired" ? "bg-[#01A3DB] border-[#01A3DB]" : "border-[#E5E5E566]"}`}>3</div>
              </div>
              {deposit && ["initiated"].includes(deposit.result) &&
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5"><use href="#svg-clock" /></svg>
                  <span className="text-[#C6C9CC]">{timesRemaining}</span>
                </div>
              }
            </div>
            <div className="flex flex-col gap-6 items-center">

              <div className="w-full flex flex-col gap-4">
                <button onClick={() => router.push(`/deposit`)} className="w-fit flex items-center gap-1 cursor-pointer hover:underline">
                  <svg className="w-5 h-5" fill="#ffffff"><use href="#svg-left-arrow" /></svg>
                  <span>Back</span>
                </button>
              </div>
              {deposit ?
                <>
                  {
                    ["initiated", "confirming"].includes(deposit.result) &&
                    <div className="w-full flex flex-col items-center gap-6">
                      <div className="flex flex-col gap-2 w-full p-6 border border-[#FE9A0033] bg-linear-to-r from-[#FE9A001A] to-[#FF69001A] rounded-2xl">
                        <p className="text-[#FFB900]">Note:</p>
                        <p className="text-[#FEF3C6CC]">Send {deposit.currency} to the following address. </p>
                      </div>
                      <div className="w-full flex flex-col gap-4">
                        <div className="block text-sm text-[#D1D5DC]">Address</div>
                        <div className="flex items-center w-full bg-[#1E293999] border border-[#E5E5E566] rounded-lg">
                          <code onClick={() => copyToClipboard(deposit.address)} className="flex-1 p-2 cursor-pointer font-mono text-sm overflow-x-auto break-all">
                            {deposit.address}
                          </code>
                          <button onClick={() => copyToClipboard(deposit.address)} className="p-2 cursor-pointer rounded-lg">
                            {copyContent}
                          </button>
                        </div>
                      </div>
                      <QRCodeImg className="w-36 h-36" value={deposit.address} />
                      {true && deposit.result === "confirming" &&
                        <div className="w-full text-center">
                          <p>Your deposit amount is ${deposit.depositAmount}</p>
                          <p>{deposit.confirmations} / 2 Confirmations</p>
                        </div>
                      }
                      <div className="w-full flex justify-between gap-2 items-center">
                        <div className="w-full flex gap-1 items-center border border-[#E5E5E566] rounded-[10px] p-2">
                          <input onChange={(e) => {
                            const val = e.target.value
                            if (validateDecimal(val)) {
                              setPrices(v => [val, (Math.ceil(Number(val) / deposit.lockedPrice * 10 ** 8) / 10 ** 8).toString()])
                            }
                          }} type="number" value={prices[0]} className="w-full text-right" />
                          <div>USD</div>
                        </div>
                        <svg className="w-10 h-10"><use href="#svg-calculator" /></svg>
                        <div className="w-full flex gap-1 items-center border border-[#E5E5E566] rounded-[10px] p-2">
                          <input onChange={(e) => {
                            const val = e.target.value
                            if (validateDecimal(val)) {
                              setPrices([(Math.ceil(Number(val) * deposit.lockedPrice * 10 ** 8) / 10 ** 8).toString(), val])
                            }
                          }} type="number" value={prices[1]} className="w-full text-right" />
                          <div className="w-fit">{CurrencyDict[deposit.currency]?.element}</div>
                        </div>
                      </div>
                    </div>
                  }
                  {deposit.result === "success" &&
                    <div className="flex flex-col items-center gap-10">
                      <div className="text-4xl text-green-400">
                        Success
                      </div>
                      <svg className="w-20 h-20"><use href="#svg-redeem" /></svg>
                      <div>
                        Your deposit amount is ${deposit.depositAmount}
                      </div>
                    </div>
                  }
                  {deposit.result === "expired" &&
                    <div className="flex flex-col items-center gap-10">
                      <div className="text-4xl text-red-400">
                        Expired
                      </div>
                      <svg className="w-20 h-20"><use href="#svg-failed" /></svg>
                    </div>
                  }</> :
                <CircularIndeterminate />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
