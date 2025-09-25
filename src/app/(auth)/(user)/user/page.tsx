"use client"

import { useState, useEffect } from "react"
import axios, { AxiosError } from "axios"
import { LineCardUserType, LineType, SportsType } from "@/types"
import { convertDecimal2AmericanOdds, convertTimestamp2HumanReadablePadded, showToast } from "@/utils"
import { useUser } from "@/store"
import Pagination from "@/components/Pagination"

export default function HomePage() {
  const { balance, setToken, winstreak, oddstype } = useUser()
  const [timeOffset, setTimeOffset] = useState(0)
  const [lines, setLines] = useState<(LineType & LineCardUserType)[]>([])
  const [sportsFilter, setSportsFilter] = useState<SportsType | "">("")
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const filteredLines = lines.filter(v => (sportsFilter === "" || v.sports === sportsFilter))
  const totalPages = Math.ceil(filteredLines.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLines = filteredLines.slice(startIndex, endIndex)
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  const [timeRemains, setTimeRemains] = useState<{ id: string, text: string }[]>([])
  const [sendingBetRequest, setSendingBetRequest] = useState(false)

  useEffect(() => {
    axios.get("/api/line", { headers: { token: localStorage.getItem("jwt") } })
      .then(
        ({ data: { lines: returned_lines, token, basets } }: { data: { lines: LineType[], token: string, basets: number } }) => {
          setLines(returned_lines.map(v => ({
            ...v,
            amount: "",
            oddsFormat: "decimal",
            side: null,
          })))
          setTimeOffset(new Date().getTime() - basets)
          setToken(token)
        }
      )
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const timesRemaining = lines.map(line => {
        const timestampDiff = line.endsAt - Math.floor(new Date().getTime()) + timeOffset
        return {
          id: line._id,
          text: convertTimestamp2HumanReadablePadded(timestampDiff)
        }
      })
      setTimeRemains(timesRemaining)
    }, 1000)
    return () => clearInterval(interval)
  }, [lines])

  const handleBet = (_id: string) => {
    const selectedLine = lines.filter(v => v._id === _id)[0];
    if (!selectedLine) return
    const timestampDiff = (selectedLine.endsAt || 0) - Math.floor(new Date().getTime())
    if (timestampDiff < 0) {
      showToast("Bet already ended", "warn")
      return
    }
    if (!selectedLine.side) {
      showToast("Select bet side", "warn")
      return
    }
    if (selectedLine.amount.trim() === "") {
      showToast("Enter amount", "warn")
      return
    }
    if ((parseFloat(selectedLine.amount) < 5 || parseFloat(selectedLine.amount) > 50)) {
      showToast("Minimum $5, Maximum $50", "warn")
      return
    }
    if (parseFloat(selectedLine.amount) > balance) {
      showToast("Invalid amount", "warn")
      return
    }
    setSendingBetRequest(true)
    const amountInNumber = parseFloat(selectedLine.amount)
    axios.post("/api/bet", {
      lineId: selectedLine._id,
      side: selectedLine.side,
      amount: amountInNumber
    }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ status, data: { bet, token } }) => {
        if (status === 201) {
          showToast("Successfully placed your bet", "success")
        }
        setToken(token)
        setLines(prevLines => prevLines.map(prevLineItem => prevLineItem._id === _id ? {
          ...selectedLine,
          amount: "",
          side: null,
        } : prevLineItem))
      })
      .catch((e: AxiosError) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      }).finally(() => setSendingBetRequest(false))
  }
  return (
    <div className="w-full flex gap-6">
      <div className="w-full flex flex-col gap-8">
        <div className="w-full flex flex-col gap-5">
          {/* <div className="w-full overflow-x-auto">
            <div className="min-w-[700px] grid grid-cols-3 gap-4">
              <PromoCard sport="Basketball" event="Kansas City Chiefs vs Buffalo Bills" icon="basketball" />
              <PromoCard sport="Soccer" event="Kansas City Chiefs vs Buffalo Bills" icon="soccer" />
              <PromoCard sport="Tennis" event="Kansas City Chiefs vs Buffalo Bills" icon="tennis" />
            </div>
          </div> */}
          <div className="w-full flex flex-col gap-4 bg-linear-to-r from-[#00BFFF1A] to-[#0077FF1A] p-6 border-[#1E2939] border rounded-[14px]">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <svg className="w-8 h-8"><use href={`#svg-cup`} /></svg>
                <svg className="w-8 h-8"><use href={`#svg-ranking`} /></svg>
                <svg className="w-8 h-8"><use href={`#svg-fire`} /></svg>
              </div>
            </div>
            <div className="text-2xl font-bold">Welcome to Picklett!</div>
            <div className="font-normal leading-6 text-[#D1D5DC]">Wage small, win bigger, and receive bonus payouts on winstreaks!</div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-5">
          <div className="w-full overflow-x-auto flex gap-2 flex-wrap">
            <SportsTab selected={sportsFilter === ""} onClick={() => { setSportsFilter(""), goToPage(1) }} icon="all-sports" category="All Sports" count={lines.length} />
            <SportsTab selected={sportsFilter === "Basketball"} onClick={() => { setSportsFilter("Basketball"), goToPage(1) }} icon="basketball" category="Basketball" count={lines.filter(v => v.sports === "Basketball").length} />
            <SportsTab selected={sportsFilter === "Soccer"} onClick={() => { setSportsFilter("Soccer"), goToPage(1) }} icon="soccer" category="Soccer" count={lines.filter(v => v.sports === "Soccer").length} />
            <SportsTab selected={sportsFilter === "Tennis"} onClick={() => { setSportsFilter("Tennis"), goToPage(1) }} icon="tennis" category="Tennis" count={lines.filter(v => v.sports === "Tennis").length} />
            <SportsTab selected={sportsFilter === "Baseball"} onClick={() => { setSportsFilter("Baseball"), goToPage(1) }} icon="baseball" category="Baseball" count={lines.filter(v => v.sports === "Baseball").length} />
            <SportsTab selected={sportsFilter === "Esports"} onClick={() => { setSportsFilter("Esports"), goToPage(1) }} icon="esports" category="Esports" count={lines.filter(v => v.sports === "Esports").length} />
            <SportsTab selected={sportsFilter === "Others"} onClick={() => { setSportsFilter("Others"), goToPage(1) }} icon="others" category="Others" count={lines.filter(v => v.sports === "Others").length} />
          </div>
          {winstreak > 1 && <div className="flex items-center gap-3 bg-[#FCC8002B] rounded-[14px] p-4">
            <svg className="w-[20px] h-[19px]"><use href="#svg-star" /></svg>
            <div>
              <p className="font-semibold">You are on {winstreak} winstreak!</p>
              <p className="text-sm text-[#D1D5DC]">Hit the next milestone {winstreak >= 7 ? 10 : winstreak >= 5 ? 7 : 5} winstreak, to receive your reward!</p>
            </div>
          </div>}
          {currentLines.map(line =>
            <div key={line._id} className="grid grid-cols-[auto_400px] max-md:grid-cols-1 gap-2 border border-[#1E2939] rounded-[14px] bg-[#101828] p-5">
              <div className="flex flex-col justify-between gap-y-2 w-full">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold">{line.question}</h2>
                  <h2 className="text-[15px] text-[#99A1AF]">{line.event} ({line.league})</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-[6px] py-[6px] px-3 bg-[#00BFFF33] rounded-full">
                    <svg className="w-[14px] h-[14px] fill-[#01A3DB] stroke-[#01A3DB]"><use href={`#svg-${line.sports?.toLowerCase()}`} /></svg>
                    <p className="text-[#00BFFF] text-xs">{line.sports}</p>
                  </div>
                  <div className="flex gap-[6px] items-center">
                    <svg className="w-[10px] h-[12px]"><use href="#svg-clock" /></svg>
                    <p className="text-sm font-semibold">
                      {
                        (() => {
                          const time = timeRemains.filter(v => v.id === line._id)[0]?.text
                          return (
                            <>{time?.includes("ago") ? "Ended: " : "Time Remaining: "}{time}</>
                          )
                        })()
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-[14px]">
                <div className="flex justify-between gap-[14px]">
                  <div className="w-full flex flex-col gap-1 justify-between border border-[#E5E5E566] rounded-lg py-[6px] px-3">
                    <label htmlFor="wager" className="w-full block text-sm text-[#99A1AF]">
                      Enter amount
                    </label>
                    <div className="flex items-center h-full gap-1">
                      <span className="font-bold text-sm">$</span>
                      <input
                        id="wager"
                        type="number"
                        value={line.amount}
                        onChange={(e) => setLines(prevLines => prevLines.map(prevLineItem => prevLineItem._id === line._id ? {
                          ...line,
                          amount: e.target.value
                        } : prevLineItem))}
                        className="w-full border-0 focus:outline-none font-bold text-sm"
                        min="1"
                        max={balance}
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="w-full flex flex-col justify-between rounded-lg py-[6px] px-3 bg-[#1E2939]">
                    <div className="text-sm text-[#99A1AF]">Payout</div>
                    <span className="flex items-center font-bold text-sm text-[#00BFFF]">
                      ${(
                        line.side === "yes" ?
                          ((parseFloat(line.amount) || 0) * (line.yes || 0)) :
                          line.side === "no" ?
                            (parseFloat(line.amount) || 0) * (line.no || 0) : 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 max-md:grid-cols-2 gap-3">
                  <button onClick={() => setLines(prevLines => prevLines.map((prevLineItem => prevLineItem._id === line._id ? {
                    ...line,
                    side: "yes"
                  } : prevLineItem)))} className={`w-full py-[14px] max-md:py-[6px] rounded-[10px] cursor-pointer hover:bg-[#00bfff4d] text-[14px] font-semibold ${line.side === "yes" ? "bg-[#00BFFF4D] text-white border border-[#00BFFF]" : "bg-[#1E2939] border border-[#1E2939]"}`}>
                    YES {oddstype === "decimal" ? `(${line.yes})` : `(${convertDecimal2AmericanOdds(line.yes || 0)})`}
                  </button>
                  <button onClick={() => setLines(prevLines => prevLines.map(prevLineItem => prevLineItem._id === line._id ? {
                    ...line,
                    side: "no"
                  } : prevLineItem))} className={`w-full py-[14px] max-md:py-[6px] rounded-[10px] cursor-pointer hover:bg-[#00bfff4d] text-[14px] font-semibold ${line.side === "no" ? "bg-[#00BFFF4D] text-white border border-[#00BFFF]" : "bg-[#1E2939] border border-[#1E2939]"}`}>
                    NO {oddstype === "decimal" ? `(${line.no})` : `(${convertDecimal2AmericanOdds(line.no || 0)})`}
                  </button>
                  <button onClick={() => handleBet(line._id)}
                    className="max-md:col-span-2 w-full py-[14px] max-md:py-[6px] rounded-[10px] border border-[#364153] text-white bg-[#14679F] hover:bg-[#3c85b6] text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed" disabled={sendingBetRequest}>
                    Place Bet
                  </button>
                </div>
              </div>
            </div>
          )}
          {lines.length === 0 && <div className="mb-4 text-center col-span-2">Theres no lines at the moment, please go to the discord to suggest a line you would like!</div>}
        </div>
        <Pagination params={{
          items: filteredLines,
          itemsPerPage,
          startIndex,
          endIndex,
          currentPage,
          totalPages,
          goToPage
        }} />
      </div>
      <SideInfoCard />
    </div>
  )
}
const SideInfoCard = () => {
  const { winstreak } = useUser()
  return (
    <div className="w-[320px] max-xl:w-[200px] shrink-0 flex flex-col gap-5 max-lg:hidden">
      <div className="flex flex-col p-4 bg-[#10182880] border border-[#1E2939] gap-2 rounded-[14px]">
        <div className="flex gap-3 items-center">
          <svg className="w-[20px] h-[19px]"><use href="#svg-fire" /></svg>
          <p className="font-semibold">Win Streak Progress</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-full h-2 rounded-full bg-[#1E2939]">
            <div className="h-2 rounded-full bg-[#F08105]" style={{ width: `${Math.ceil(winstreak * 100 / (winstreak >= 7 ? 10 : winstreak >= 5 ? 7 : 5))}%` }}></div>
          </div>
          <p className="text-[#99A1AF] text-xs">{winstreak}/{winstreak >= 7 ? 10 : winstreak >= 5 ? 7 : 5}  wins to unlock {winstreak >= 7 ? "Gold" : winstreak >= 5 ? "Silver" : "Bronze"} reward</p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-[18px]">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <svg className="w-4 h-4"><use href="#svg-crown" /></svg>
            <span className="text-sm font-semibold">Top Bettors</span>
          </div>
          <svg className="w-3 h-3"><use href="#svg-refresh" /></svg>
        </div>
        {/* <div className="flex flex-col gap-3">
          <div className="p-2 flex gap-3 items-center">
            <div className="relative flex justify-center items-center w-8">
              <Image alt="top-bettor-avatar-1" width={32} height={32} src="/avatar1.png" />
              <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-[#F0B100] rounded-full text-black text-xs text-center">1</div>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex text-sm font-semibold items-center gap-2">
                CryptoKing
                <svg className="w-4 h-4"><use href="#svg-crown" /></svg>
              </div>
              <div className="w-full flex justify-between">
                <p className="text-xs text-[#05DF72] font-semibold">+$2,847</p>
                <p className="text-xs text-[#99A1AF]">12 streak</p>
              </div>
            </div>
          </div>
          <div className="p-2 flex gap-3 items-center">
            <div className="relative flex justify-center items-center w-8">
              <Image alt="top-bettor-avatar-2" width={32} height={32} src="/avatar2.png" />
              <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-[#99A1AF] rounded-full text-black text-xs text-center">2</div>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex text-sm font-semibold items-center gap-2">
                BetMaster
                <svg className="w-4 h-4"><use href="#svg-silver" /></svg>
              </div>
              <div className="w-full flex justify-between">
                <p className="text-xs text-[#05DF72] font-semibold">+$1,923</p>
                <p className="text-xs text-[#99A1AF]">8 streak</p>
              </div>
            </div>
          </div>
          <div className="p-2 flex gap-3 items-center">
            <div className="relative flex justify-center items-center w-8">
              <Image alt="top-bettor-avatar-3" width={32} height={32} src="/avatar3.png" />
              <div className="absolute top-[-8px] right-[-8px] w-4 h-4 bg-[#F54900] rounded-full text-white text-xs text-center">3</div>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex text-sm font-semibold items-center gap-2">
                LuckyStrike
                <svg className="w-4 h-4"><use href="#svg-bronze" /></svg>
              </div>
              <div className="w-full flex justify-between">
                <p className="text-xs text-[#05DF72] font-semibold">+$1,456</p>
                <p className="text-xs text-[#99A1AF]">6 streak</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between items-center p-4">
          <div className="flex gap-2 items-center">
            <svg className="w-4 h-4"><use href="#svg-chart" /></svg>
            <span className="text-sm font-semibold">Live Activity</span>
          </div>
          <svg className="w-3 h-3"><use href="#svg-refresh" /></svg>
        </div>
        {/* <div className="p-4 flex gap-3">
          <div className="W-8">
            <Image alt="top-bettor-avatar-1" width={32} height={32} src="/avatar1.png" />
          </div>
          <div className="w-full flex-col gap-1">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">ProGamer99</p>
              <p className="text-xs text-[#6A7282]">2m ago</p>
            </div>
            <p className="text-xs text-[#D1D5DC] font-semibold">Won big <span className="text-[#05DF72]">+$450</span></p>
            <p className="text-xs text-[#D1D5DC] font-semibold">Lakers vs Warriors Over 220.5</p>
            <div className="py-1 px-2 text-xs text-[#05DF72] bg-[#0D542B4D] w-fit rounded-sm mt-1">
              🎉 Big Win!
            </div>
          </div>
        </div>
        <div className="p-4 flex gap-3">
          <div className="W-8">
            <Image alt="top-bettor-avatar-2" width={32} height={32} src="/avatar2.png" />
          </div>
          <div className="w-full flex-col gap-1">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">SportsFan</p>
              <p className="text-xs text-[#6A7282]">5m ago</p>
            </div>
            <p className="text-xs text-[#D1D5DC] font-semibold">placed bet <span className="text-[#00BFFF]">$25</span></p>
            <p className="text-xs text-[#D1D5DC] font-semibold">Chiefs -3.5 vs Bills</p>
          </div>
        </div>
        <div className="p-4 flex gap-3">
          <div className="W-8">
            <Image alt="top-bettor-avatar-3" width={32} height={32} src="/avatar3.png" />
          </div>
          <div className="w-full flex-col gap-1">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">BetWizard</p>
              <p className="text-xs text-[#6A7282]">8m ago</p>
            </div>
            <p className="text-xs text-[#D1D5DC] font-semibold">hit streak <span className="text-[#FDC700]">7 wins</span></p>
            <p className="text-xs text-[#D1D5DC] font-semibold">Unlocked Silver tier</p>
            <div className="py-1 px-2 text-xs text-[#FDC700] bg-[#733E0A4D] w-fit rounded-sm mt-1">
              🏆 Milestone!
            </div>
          </div>
        </div>
        <div className="p-4 flex gap-3">
          <div className="W-8">
            <Image alt="top-bettor-avatar-4" width={32} height={32} src="/avatar1.png" />
          </div>
          <div className="w-full flex-col gap-1">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">RiskyBiz</p>
              <p className="text-xs text-[#6A7282]">12m ago</p>
            </div>
            <p className="text-xs text-[#D1D5DC] font-semibold">lost bet <span className="text-[#FF6467]">-$100</span></p>
            <p className="text-xs text-[#D1D5DC] font-semibold">Cowboys +7 vs Eagles</p>
          </div>
        </div> */}
      </div>
    </div>
  )
}
const PromoCard = ({ sport, event, icon }: { sport: string, event: string, icon: string }) => {
  return (
    <div className="w-full rounded-[10px] p-3 bg-[#1E2939B2]/70 flex gap-3">
      <div className="w-[25%] shrink-0 ">
        <div className="aspect-square bg-[#283343] rounded-2xl flex justify-center items-center">
          <svg className="w-[30px] h-[30px] fill-[#01A3DB] stroke-[#01A3DB]"><use href={`#svg-${icon}`} /></svg>
        </div>
      </div>
      <div className="flex flex-col justify-between items-start gap-1">
        <div>
          <div className="font-semibold text-sm">{sport}</div>
          <div className="font-normal text-[15px] max-md:text-xs text-[#99A1AF]">{event}</div>
        </div>
        <button className="px-3 text-sm max-md:text-xs max-md:py-2 py-[10px] border-[#00BFFF] border rounded-[10px] font-semibold">Place Bet</button>
      </div>
    </div>
  )
}
const SportsTab = ({ selected, icon, category, count, onClick }: { selected?: boolean, icon: string, category: string, count?: number, onClick?: () => void }) => {
  return (
    <button onClick={onClick} className={`flex gap-3 items-center ${selected ? "bg-[#004b64]" : "bg-[#1E2939B2]"} border border-[#1E2939B2] px-3 py-[10px] rounded-[10px] whitespace-nowrap select-none cursor-pointer hover:border hover:border-[#01A3DB] disabled:hover:border-[#1E2939B2] disabled:cursor-not-allowed`} disabled={!count || count === 0}>
      <div className="flex items-center gap-[7px]">
        <svg className="w-[14px] h-[14px] fill-white stroke-white"><use href={`#svg-${icon}`} /></svg>
        <div className="text-sm font-semibold">{category}</div>
      </div>
      {count !== undefined && count > 0 && <div className="text-xs font-semibold leading-4 py-[2px] px-2 rounded-full bg-[#4A5565]">{count}</div>}
    </button>
  )
}