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
import { CoinDisplay, CoinImage } from "@/components/Miscellaneous"
import Link from "next/link"
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
      <div className="w-full flex flex-col gap-6">
        <div className="flex justify-center">
          <div className="w-lg p-8 max-md:p-4 bg-[#0E1B2F] border border-[#31415880] rounded-[10px] flex flex-col gap-6">
            <div className="w-full flex justify-center gap-20 border-b border-white/10">
              <Link href="/deposit" className="border-b text-center cursor-pointer select-none border-[#1475E1]">Deposit</Link>
              <Link href="/withdraw" className="border-b text-center cursor-pointer select-none border-white/10">Withdraw</Link>
            </div>
            <div className="flex flex-col gap-4 justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex justify-center items-center p-2 border border-[#01A3DB] bg-[#01A3DB]">1</div>
                <div className="h-[2px] w-8 bg-[#01A3DB]"></div>
                <div className="w-9 h-9 rounded-full flex justify-center items-center p-2 border bg-[#01A3DB] border-[#01A3DB]">2</div>
                <div className={`h-[2px] w-8 ${deposit?.result === "success" || deposit?.result === "expired" ? "bg-[#01A3DB]" : "bg-[#E5E5E566]"}`}></div>
                <div className={`w-9 h-9 rounded-full flex justify-center items-center p-2 ${deposit?.result === "success" || deposit?.result === "expired" ? "bg-[#01A3DB] border border-[#01A3DB]" : "bg-[#E5E5E566]"}`}>3</div>
              </div>
              {deposit && ["initiated"].includes(deposit.result) &&
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5"><use href="#svg-clock-new" /></svg>
                  <span className="text-[#F59E0B]">{timesRemaining}</span>
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
                      <div className="flex gap-2 items-start w-full p-3 border border-white/20 bg-[#0D111B]/60 rounded-xl">
                        <svg className="w-4 h-4"><use href="#svg-i" /></svg>
                        <p className="w-full text-xs text-white/70">Note: Send {deposit.currency} to the following address.</p>
                      </div>
                      <div className="w-full flex flex-col gap-4">
                        <div className="block text-sm">Address</div>
                        <div className="flex items-center w-full bg-white/10 pl-2  border border-[#E5E5E566] rounded-lg">
                          <CoinImage src={CurrencyDict[deposit.currency].url} />
                          <code onClick={() => copyToClipboard(deposit.address)} className="flex-1 py-2 px-1 cursor-pointer font-mono text-sm overflow-x-auto break-all">
                            {deposit.address}
                          </code>
                          <button onClick={() => copyToClipboard(deposit.address)} className="pr-2 cursor-pointer rounded-lg">
                            {copyContent}
                          </button>
                        </div>
                      </div>
                      <QRCodeImg className="w-36 h-36 rounded-lg overflow-hidden" value={deposit.address} />
                      {true && deposit.result === "confirming" &&
                        <div className="w-full text-center">
                          <p>Your deposit amount is ${deposit.depositAmount}</p>
                          <p>{deposit.confirmations} / 2 Confirmations</p>
                        </div>
                      }
                      <div className="flex flex-col gap-4">
                        <div className="block text-sm w-full">Calculator</div>
                        <div className="w-full flex justify-between gap-2 items-center">
                          <div className="w-full flex gap-1 items-center border border-[#E5E5E566]  bg-[#0D111B] rounded-[10px] px-2 py-1">
                            <input onChange={(e) => {
                              const val = e.target.value
                              if (validateDecimal(val)) {
                                setPrices(v => [val, (Math.ceil(Number(val) / deposit.lockedPrice * 10 ** 8) / 10 ** 8).toString()])
                              }
                            }} type="number" value={prices[0]} className="w-full text-right" />
                            <div>USD</div>
                          </div>
                          <svg className="w-10 h-10"><use href="#svg-calculator" /></svg>
                          <div className="w-full flex gap-1 items-center border border-[#E5E5E566] bg-[#0D111B] rounded-[10px] px-2 py-1">
                            <input onChange={(e) => {
                              const val = e.target.value
                              if (validateDecimal(val)) {
                                setPrices([(Math.ceil(Number(val) * deposit.lockedPrice * 10 ** 8) / 10 ** 8).toString(), val])
                              }
                            }} type="number" value={prices[1]} className="w-full text-right" />
                            <div className="w-fit">
                              <CoinDisplay coin={deposit.currency} src={CurrencyDict[deposit.currency].url} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  {deposit.result === "success" &&
                    <div className="w-full flex flex-col items-center gap-4">
                      <svg className="w-14 h-14"><use href="#svg-success" /></svg>
                      <span className="text-[18px]">Deposit Success</span>
                      <div className="flex flex-col gap-2 w-full rounded-lg border border-white/20 bg-[#1C2534] p-2">
                        <div className="w-full flex justify-between items-center">
                          <span className="text-white/80">Currency</span>
                          <CoinDisplay coin={deposit.currency} src={CurrencyDict[deposit.currency].url} />
                        </div>
                        <div className="w-full flex justify-between items-center">
                          <span className="text-white/80">Network</span>
                          {CurrencyDict[deposit.currency].availableNetworks}
                        </div>
                        <div className="w-full flex justify-between items-center">
                          <span className="text-white/80">Amount</span>
                          {deposit.depositAmount} USD
                        </div>
                      </div>
                      <Link href="/transactions/deposit" className="w-full text-center text-black text-[18px] font-medium bg-white rounded-lg py-2 px-6">View Transaction History</Link>
                      <Link href="/deposit" className="w-full text-[18px] font-medium bg-[#1475E1] text-center rounded-lg py-2 px-6">Make Another Deposit</Link>
                    </div>
                  }
                  {deposit.result === "expired" &&
                    <div className="w-full flex flex-col items-center gap-4">
                      <svg className="w-14 h-14"><use href="#svg-expired" /></svg>
                      <span className="text-[18px]">Expired</span>
                      <div className="w-full bg-[#EF4444]/8 p-3 rounded-lg border border-white/10 flex flex-col gap-2 items-center">
                        <span className="text-[#EF4444]">This deposit address has expired</span>
                        <span className="text-[#EF4444] text-sm text-center">For security reasons, deposit addresses are only valid for 20 minutes. Please generate a new address to continue.</span>
                      </div>
                      <Link href="/deposit" className="w-full flex items-center gap-2 justify-center text-black text-[18px] font-medium bg-white rounded-lg py-2 px-6">
                        <svg className="w-5 h-5 stroke-black"><use href="#svg-refresh" /></svg>
                        Generate New Address
                      </Link>
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
