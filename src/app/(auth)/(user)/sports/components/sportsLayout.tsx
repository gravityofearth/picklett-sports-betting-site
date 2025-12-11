"use client"

import { CircularIndeterminate, SearchHighlight } from "@/components/MUIs";
import { useUser } from "@/store";
import { BetSlipType } from "@/types";
import { formatOddsValue, showToast, validateCurrency } from "@/utils";
import { formatOddsPointTitle, ODDS_TITLE, UNIT_TITLE } from "@/utils/line";
import axios from "axios";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

const BetSlipContext = createContext<{
  showBetSlip: boolean,
  setShowBetSlip: Dispatch<SetStateAction<boolean>>,
  betSlips: BetSlipType[],
  setBetSlips: Dispatch<SetStateAction<BetSlipType[]>>,
  search: string,
  setSearch: Dispatch<SetStateAction<string>>
}>({
  showBetSlip: false,
  setShowBetSlip: () => { },
  betSlips: [],
  setBetSlips: () => { },
  search: "",
  setSearch: () => { }
})
export const useBetSlip = () => ({
  showBetSlip: useContext(BetSlipContext).showBetSlip,
  setShowBetSlip: useContext(BetSlipContext).setShowBetSlip,
  betSlips: useContext(BetSlipContext).betSlips,
  setBetSlips: useContext(BetSlipContext).setBetSlips,
  search: useContext(BetSlipContext).search,
  setSearch: useContext(BetSlipContext).setSearch,
})
export function SportsLayout({ children, loggedIn, oddstype }: Readonly<{ children: React.ReactNode; loggedIn?: boolean, oddstype: "decimal" | "american" }>) {
  const [showBetSlip, setShowBetSlip] = useState(false)
  const [betSlips, setBetSlips] = useState<BetSlipType[]>([])
  const [search, setSearch] = useState("")
  const [sending, setSending] = useState(false)
  const { balance, setToken } = useUser()
  const handlePlaceBet = () => {
    if (!loggedIn) {
      showToast("Please login to place bet", "info")
      return
    }
    let passed = true
    for (let betSlip of betSlips) {
      const timestampDiff = betSlip.startsAt - Math.floor(new Date().getTime())
      if (timestampDiff < 0) {
        showToast(
          <ul>
            <li>Event already started</li>
            <li>{betSlip.home} vs {betSlip.away}</li>
          </ul>,
          "warn"
        )
        passed = false
        return
      }
      if (betSlip.amount.trim() === "") {
        showToast(
          <ul>
            <p>Enter amount</p>
            <p>{betSlip.home} vs {betSlip.away}</p>
          </ul>,
          "warn"
        )
        passed = false
        return
      }
      if ((parseFloat(betSlip.amount) < 5 || parseFloat(betSlip.amount) > 50)) {
        showToast(
          <ul>
            <p>Minimum $5, Maximum $50</p>
            <p>{betSlip.home} vs {betSlip.away}</p>
          </ul>,
          "warn"
        )
        passed = false
        return
      }
    }
    if (!passed) return
    if (betSlips.reduce((prev: number, cur: BetSlipType) => (Number(cur.amount) + prev), 0) > balance) {
      showToast("Out of balance", "warn")
      return
    }
    setSending(true)
    const data = betSlips.map(({ lineId, unit, num, description, oddsName, point, team_total_point, value, hash, index, amount }) => ({ lineId, unit, num, description, oddsName, point, team_total_point, value, hash, index, amount }))
    axios.post("/api/bet", { data }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ status, data: { token } }) => {
        if (status === 201) {
          showToast("Successfully placed your bet", "success")
        }
        setToken(token)
        setBetSlips([])
      })
      .catch((e) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      }).finally(() => setSending(false))
  }
  return (
    <BetSlipContext.Provider value={{ showBetSlip, setShowBetSlip, betSlips, setBetSlips, search, setSearch }}>
      <div className="-my-6 max-md:-my-4 flex gap-1 w-full h-[calc(100vh-116px-32px)] max-md:h-[calc(100vh-80px-32px)]">
        <div className={`w-full h-full overflow-y-auto ${showBetSlip ? "max-md:hidden" : ""}`}>
          {children}
          <div className={`fixed ${showBetSlip ? "md:hidden" : ""} left-0 right-0 pl-14 bottom-0 flex justify-center`}>
            <div onClick={() => setShowBetSlip(true)} className="flex justify-center items-center gap-2 rounded-t-md bg-[#072443] w-fit px-4 cursor-pointer">
              <span>Bet Slip</span>
              {betSlips.length > 0 && <div className="rounded-full w-6 max-md:w-4 h-6 max-md:h-4 flex justify-center items-center bg-[#1475E1] max-md:text-sm shrink-0">{betSlips.length}</div>}
            </div>
          </div>
        </div>
        {showBetSlip && <div className="relative w-lg max-md:w-full h-full bg-[#0E1B2F] flex flex-col gap-6 p-6 max-md:p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <svg className="w-6 max-md:w-4 h-6 max-md:h-4"><use href="#svg-bet-slip" /></svg>
              <span className="text-xl max-md:text-sm font-semibold">Bet Slip</span>
              {betSlips.length > 0 && <div className="rounded-full w-6 max-md:w-4 h-6 max-md:h-4 flex justify-center items-center bg-[#1475E1] max-md:text-sm shrink-0">{betSlips.length}</div>}
            </div>
            <svg onClick={() => setShowBetSlip(false)} className="w-5 h-5 cursor-pointer"><use href="#svg-close-new" /></svg>
          </div>
          {betSlips.length === 0 ?
            <div className="w-full h-full flex justify-center items-center">
              No Selections Yet
            </div> :
            <div className="w-full h-full overflow-y-auto flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                {
                  betSlips.map((betSlip, i) =>
                    <BetSlip key={i} betSlip={betSlip} oddstype={oddstype} />
                  )
                }
              </div>
              <div className="w-full flex flex-col md:font-medium gap-2">
                <div className="w-full max-md:text-sm rounded-lg flex flex-col gap-2 p-4 bg-[#0f182b]">
                  <div className="flex justify-between items-center">
                    <span>Total Amount</span>
                    <span>${betSlips.reduce((prev: number, cur: BetSlipType) => (Number(cur.amount) + prev), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Win</span>
                    <span>${betSlips.reduce((prev: number, cur: BetSlipType) => (Number(cur.value) * Number(cur.amount) + prev), 0).toFixed(2)}</span>
                  </div>
                  <div className="w-full border border-white/50 border-dashed"></div>
                  <div className="flex justify-between items-center">
                    <span>Total Payout</span>
                    <span>${betSlips.reduce((prev: number, cur: BetSlipType) => ((Number(cur.value) - 1) * Number(cur.amount) + prev), 0).toFixed(2)}</span>
                  </div>
                </div>
                {sending ?
                  <div className="w-full h-[60px] flex justify-center items-center"><CircularIndeterminate /></div> :
                  <button onClick={handlePlaceBet} className="md:mx-2 bg-[#1475e1] hover:bg-[#1475f188] rounded-lg py-2 max-md:p-2 cursor-pointer">Place Bet</button>
                }
              </div>
            </div>
          }
        </div>
        }
      </div>
    </BetSlipContext.Provider>
  )
}
const BetSlip = ({ betSlip, oddstype }: { betSlip: BetSlipType, oddstype: "decimal" | "american" }) => {
  const { home, away, leagueName, point, team_total_point, description, oddsName, index, value, amount, unit } = betSlip
  const { setSearch, setBetSlips } = useBetSlip()
  const shoudMatchKeys: (keyof BetSlipType)[] = ["lineId", "unit", "num", "oddsName", "point", "team_total_point"]
  const filter = (v: BetSlipType) => shoudMatchKeys.every(key => v[key] === betSlip[key])
  const setAmount = (amount: string) => setBetSlips(prevSlips => prevSlips.map(v => filter(v) ? ({ ...v, amount }) : v))
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex rounded-2xl max-md:rounded-lg overflow-hidden bg-[#1475E1]/10">
        <button onClick={() => setBetSlips(prevSlips => prevSlips.filter(v => !filter(v)))} className="px-1 bg-white/20 flex justify-center items-center cursor-pointer hover:bg-white/40">
          <svg className="w-6 max-md:w-4 h-6 max-md:h-4"><use href="#svg-close-new" /></svg>
        </button>
        <div className="flex flex-col w-full gap-1 max-md:gap-0.5 py-2 px-4 max-md:px-2">
          {
            (() => {
              const teamName = oddsName === "team_total" ? (point === "home" ? home : away) : [home, away][index]
              const prefix = oddsName === "totals" ? "" : `${teamName} - `
              return <>
                <button onClick={() => setSearch(`"${leagueName}"`)} className="text-white/70 text-xs cursor-pointer hover:bg-[#333] text-left">{leagueName} - {betSlip.sports}</button>
                <button onClick={() => setSearch(`"${home}" "${away}"`)} className="text-white/70 text-xs cursor-pointer hover:bg-[#333] text-left">
                  <SearchHighlight className="italic underline bg-transparent text-white/70" text={`${home} vs ${away}`} search={`"${teamName}"`} />
                </button>
                <button onClick={() => setSearch(`"${teamName}"`)} className="text-white/70 text-xs cursor-pointer hover:bg-[#333] text-left">
                  <SearchHighlight className="underline bg-transparent text-white/70" text={`${UNIT_TITLE[unit]}${prefix}${ODDS_TITLE[oddsName]} - ${description}`} search={`"${teamName}"`} />
                </button>
                <div className="flex justify-between">
                  <span className="text-xs">
                    {formatOddsPointTitle({ oddsName, team: [betSlip.home, betSlip.away][index], point, team_total_point, index })}
                  </span>
                  <span className="text-md max-md:text-xs font-bold text-orange-500">{formatOddsValue(Number(value), oddstype)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <div className="w-full flex flex-col bg-black/30 pl-4 max-md:pl-1 rounded-md border border-white/50">
                    <span className="text-white/80 text-sm">Amount</span>
                    <div className="flex gap-1 max-md:gap-0.5 rounded-sm max-md:text-sm w-28 max-md:w-20">
                      <span className="font-medium">$</span>
                      <input value={amount} onChange={(e) => {
                        e.preventDefault()
                        if (!validateCurrency(e.target.value)) return
                        setAmount(e.target.value)
                      }} type="text" className="w-full" />
                    </div>
                  </div>
                  <div className="w-full flex flex-col bg-[#1E293988] pl-4 max-md:pl-1 rounded-md">
                    <span className="text-white/80 text-sm">Payout</span>
                    {amount && <span className="md:font-semibold max-md:text-sm">${(Number(amount) * (Number(value) - 1)).toFixed(2)}</span>}
                  </div>
                </div>
                <div className="flex gap-2 w-full justify-between">
                  {[5, 10, 25, 50].map((v, i) => <button key={i} onClick={() => setAmount(v.toString())} className="p-1 w-full bg-white/10 rounded-sm text-center font-medium cursor-pointer">{v}</button>)}
                </div>
              </>
            })()
          }
        </div>
      </div>
    </div>
  )
}