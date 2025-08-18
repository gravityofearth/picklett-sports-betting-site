"use client"

import { useState, useEffect } from "react"
import axios, { AxiosError } from "axios"
import { BetType, LineCardUserType, LineType } from "@/types"
import { convertDecimal2AmericanOdds, convertTimestamp2HumanReadablePadded, showToast } from "@/utils"
import BetTable from "@/components/BetTable"
import { useUser } from "@/store"


export default function HomePage() {
  const { username, balance, setToken } = useUser()
  const [timeOffset, setTimeOffset] = useState(0)
  const [lines, _setLines] = useState<(LineType & LineCardUserType)[]>([])
  const setLines: React.Dispatch<React.SetStateAction<(LineType & LineCardUserType)[]>> = (update) => {
    if (typeof update === 'function') {
      _setLines(prev => {
        const newVal = (update as (prev: (LineType & LineCardUserType)[]) => (LineType & LineCardUserType)[])(prev);
        return newVal.sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    } else {
      _setLines(update.sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    }
  };
  const [timeRemains, setTimeRemains] = useState<{ id: string, text: string }[]>([])
  const [sendingBetRequest, setSendingBetRequest] = useState(false)
  const [userBets, setUserBets] = useState<BetType[]>([])

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
    axios.get("/api/bet", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { bet } }) => {
        setUserBets(bet)
      })

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
      showToast("Out of range", "warn")
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
        setUserBets(v => ([bet, ...v]))
        setToken(token)
        setLines(l => ([
          ...l.filter(lf => lf._id !== _id),
          {
            ...selectedLine,
            amount: "",
            side: null,
          }
        ]))
      })
      .catch((e: AxiosError) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      }).finally(() => setSendingBetRequest(false))
  }
  return (
    <>
      <div className="text-center text-lg p-4 border-4 border-gray-300 border-double">Welcome to Picklett!<br />Your sports betting bookie that does not want you to go broke overnight.<br />Wage small, win bigger, and receive bonus payouts on winstreaks!</div>
      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 w-full">
        {lines.map(line =>
          <div key={line._id} className="border border-gray-200 p-6">
            <h2 className="text-lg mb-4 text-center">{line.question}</h2>
            <div className="mb-4 grid grid-cols-3 gap-2">
              <button onClick={() => setLines(prevLines => ([
                ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                {
                  ...line,
                  side: "yes"
                }
              ]))} className={`h-7 self-end border border-gray-300 cursor-pointer hover:border-black/50 ${line.side === "yes" && "bg-black/70 text-white"}`}>
                YES {line.oddsFormat === "decimal" ? `(${line.yes})` : `(${convertDecimal2AmericanOdds(line.yes || 0)})`}
              </button>
              <button onClick={() => setLines(prevLines => ([
                ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                {
                  ...line,
                  side: "no"
                }
              ]))} className={`h-7 self-end border border-gray-300 cursor-pointer hover:border-black/50 ${line.side === "no" && "bg-black/70 text-white"}`}>
                NO {line.oddsFormat === "decimal" ? `(${line.no})` : `(${convertDecimal2AmericanOdds(line.no || 0)})`}
              </button>
              <div className="flex flex-col justify-end items-end">
                <span className="text-sm">Odds format:</span>
                <select
                  value={line.oddsFormat}
                  onChange={(e) => setLines(prevLines => ([
                    ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                    {
                      ...line,
                      oddsFormat: e.target.value as "american" | "decimal"
                    }
                  ]))}
                  className="text-sm p-1 border border-gray-300"
                >
                  <option value="decimal">Decimal</option>
                  <option value="american">American</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <label htmlFor="wager" className="block mb-2 text-sm">
                  Enter Amount (<span className="text-red-700">Amount range: $5~$50</span>)
                </label>
                <div className="mb-2 text-sm">Est. Payout</div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center border border-gray-300 p-2">
                  <span className="px-1">$</span>
                  <input
                    id="wager"
                    type="number"
                    value={line.amount}
                    onChange={(e) => setLines(prevLines => ([
                      ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                      {
                        ...line,
                        amount: e.target.value
                      }
                    ]))}
                    className="w-full border-0 focus:outline-none"
                    min="1"
                    max={balance}
                    step="0.01"
                  />
                </div>
                {line.amount && line.side &&
                  <span className="flex items-center text-4xl">
                    ${(line.side === "yes" ?
                      (parseFloat(line.amount) * (line.yes || 0)) :
                      parseFloat(line.amount) * (line.no || 0)
                    ).toFixed(2)}
                  </span>
                }
              </div>
            </div>

            <button onClick={() => handleBet(line._id)}
              className="w-full mt-4 p-2 text-white bg-black mb-4 hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingBetRequest}>
              Place Bet
            </button>

            <div className="text-center mb-2">Time remaining: {timeRemains.filter(v => v.id === line._id)[0]?.text}</div>


          </div>
        )
        }
        {lines.length === 0 && <div className="mb-4 text-center col-span-2">Theres no lines at the moment, please go to the discord to suggest a line you would like!</div>}
      </div>
      {username && <BetTable userBets={userBets} username={username} adminPage={username === "admin"} />}

    </>
  )
}
