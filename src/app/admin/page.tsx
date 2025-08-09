"use client"
import { convertAmerican2DecimalOdds, convertDecimal2AmericanOdds, showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BetType } from "@/types"
import BetTable from "@/components/BetTable"
import Link from "next/link"

export default function AdminPage() {
  const [question, setQuestion] = useState("")
  const router = useRouter()
  const [_id, set_id] = useState<undefined | string>(undefined)
  const [yes_decimal, setYes_decimal] = useState("")
  const [no_decimal, setNo_decimal] = useState("")
  const [yes_american, setYes_american] = useState("")
  const [no_american, setNo_american] = useState("")
  const [yesOdds, setYesOdds] = useState(1)
  const [noOdds, setNoOdds] = useState(1)
  const [endsAtStr, setEndsAtStr] = useState("0")
  const [endsAt, setEndsAt] = useState(0)
  const [result, setResult] = useState<"yes" | "no" | "pending" | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [userBets, setUserBets] = useState<BetType[]>([])
  const [yesRate, setYesRate] = useState(50)
  const [oddsFormat, setOddsFormat] = useState<"american" | "decimal">("decimal")
  const [changed, setChanged] = useState(0)
  useEffect(() => {
    if (yesOdds === 0 || yesOdds === 1)
      return
    setChanged(v => v + 1)
  }, [question, yesOdds, noOdds, endsAt])
  useEffect(() => {
    if (oddsFormat === prev_oddsFormat.current) {
      setYesOdds(oddsFormat === "decimal" ? Number(yes_decimal) : convertAmerican2DecimalOdds(Number(yes_american)))
      setNoOdds(oddsFormat === "decimal" ? Number(no_decimal) : convertAmerican2DecimalOdds(Number(no_american)))
    } else {
      setYesOdds(oddsFormat === "american" ? Number(yes_decimal) : convertAmerican2DecimalOdds(Number(yes_american)))
      setNoOdds(oddsFormat === "american" ? Number(no_decimal) : convertAmerican2DecimalOdds(Number(no_american)))

      if (oddsFormat === "american") {
        yes_decimal && setYes_american(`${convertDecimal2AmericanOdds(Number(yes_decimal))}`)
        no_decimal && setNo_american(`${convertDecimal2AmericanOdds(Number(no_decimal))}`)
      } else {
        yes_american && setYes_decimal(`${convertAmerican2DecimalOdds(Number(yes_american))}`)
        no_american && setNo_decimal(`${convertAmerican2DecimalOdds(Number(no_american))}`)
      }
    }

  }, [oddsFormat, yes_decimal, no_decimal, yes_american, no_american])

  const prev_oddsFormat = useRef("decimal")
  useEffect(() => { prev_oddsFormat.current = oddsFormat }, [oddsFormat])
  useEffect(() => { setEndsAt((new Date(endsAtStr)).getTime()) }, [endsAtStr])
  const [winningSide, setWinningSide] = useState("")
  const handleLine = () => {
    setSendingRequest(true);
    (_id ? axios.put : axios.post)("/api/line", {
      question, yes: yesOdds, no: noOdds, endsAt, result: "pending", _id
    }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ status, data: { line } }) => {
        if (status === 201) {
          showToast("Successfully created betting line!", "success")
        }
        if (status === 202) {
          showToast("Successfully updated betting line!", "success")
        }
        setChanged(0)
      })
      .catch((e: AxiosError) => {
        showToast(e.response?.statusText, "error")
      }).finally(() => setSendingRequest(false))
  }

  const handleResolve = () => {
    if (winningSide?.trim() === "") {
      showToast("Select winning side", "warn")
      return
    }
    setSendingRequest(true)
    axios.post("/api/bet/resolve", { lineId: _id, winningSide }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ status }) => {
        if (status === 200) {
          showToast("Successfully resolved betting", "success")
        }
        fetchData()
      })
      .catch(e => {
        showToast(e.response?.statusText, "error")
      }).finally(() => setSendingRequest(false))
  }
  const logout = () => {
    localStorage.removeItem("jwt")
    router.push("/login")
  }
  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [])

  const total = userBets.filter(v => v.status === "pending").length
  const yesCount = userBets.filter(v => v.status === "pending" && v.side === "yes").length
  useEffect(() => {
    const yesRate = Math.floor(yesCount * 100 / total)
    setYesRate(yesRate)
  }, [userBets])
  const fetchData = () => {
    axios.get("/api/line", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { line, token } }) => {
        if (line) {
          set_id(line._id)
          setQuestion(line.question)
          setYes_decimal(line.yes)
          setNo_decimal(line.no)
          setResult(line.result)
          setEndsAtStr(`${new Date(line.endsAt || 0).toLocaleDateString("sv-SE")}T${new Date(line.endsAt || 0).toLocaleTimeString("sv-SE")}`)
        } else {
          set_id(undefined)
          setQuestion("")
          setYes_decimal("")
          setNo_decimal("")
          setResult(null)
          setEndsAtStr(`${new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString("sv-SE")}T${new Date().toLocaleTimeString("sv-SE")}`)
        }
        localStorage.setItem("jwt", token)
      })
      .finally(() => {
        setLoading(false)
      })
    axios.get("/api/bet", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { bet } }) => {
        setUserBets(bet)
      })
  }
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Admin Panel</h1>
        <div className="flex gap-2">
          <Link href="/home">Betting page</Link>
          <button className="cursor-pointer" onClick={logout}>Logout</button>
        </div>
      </div>
      {loading ? "Loading..." :
        <>
          <div className="flex gap-4 justify-center mb-6">
            <Link className="p-4 border border-gray-300 w-full flex justify-center hover:bg-gray-200 cursor-pointer" href={"/admin/deposit"}>
              Deposit History
            </Link>
            <Link className="p-4 border border-gray-300 w-full flex justify-center hover:bg-gray-200 cursor-pointer" href={"/admin/withdraw"}>
              Withdraw History
            </Link>
          </div>
          <div className="border border-gray-200 p-6 mb-6">
            <h2 className="text-lg mb-4">Set Betting Line</h2>
            <div>
              <div className="mb-4">
                <label htmlFor="question" className="block mb-2 text-sm">
                  Today's Question
                </label>
                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-2 border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-5 gap-4 mb-4">
                <div className="col-span-2">
                  <label htmlFor="yesOdds" className="block mb-2 text-sm">
                    Yes Odds
                  </label>
                  {oddsFormat === "decimal" ?
                    <input
                      id="yesOdds"
                      type="text"
                      value={yes_decimal}
                      onChange={(e) => setYes_decimal(e.target.value)}
                      className="w-full p-2 border border-gray-300"
                      placeholder="1.8"
                    /> :
                    <input
                      id="yesOdds"
                      type="text"
                      value={yes_american}
                      onChange={(e) => setYes_american(e.target.value)}
                      className="w-full p-2 border border-gray-300"
                      placeholder="-110"
                    />
                  }
                </div>

                <div className="col-span-2">
                  <label htmlFor="noOdds" className="block mb-2 text-sm">
                    No Odds
                  </label>
                  {oddsFormat === "decimal" ?
                    <input
                      id="noOdds"
                      type="text"
                      value={no_decimal}
                      onChange={(e) => setNo_decimal(e.target.value)}
                      className="w-full p-2 border border-gray-300"
                      placeholder="1.2"
                    /> :
                    <input
                      id="noOdds"
                      type="text"
                      value={no_american}
                      onChange={(e) => setNo_american(e.target.value)}
                      className="w-full p-2 border border-gray-300"
                      placeholder="-180"
                    />
                  }
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm">Odds format:</span>
                  <select
                    value={oddsFormat}
                    onChange={(e) => setOddsFormat(e.target.value as "american" | "decimal")}
                    className="text-sm p-1 border border-gray-300"
                  >
                    <option value="decimal">Decimal</option>
                    <option value="american">American</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="cutoffTime" className="block mb-2 text-sm">
                  Cutoff Time (UTC)
                </label>
                <input
                  id="cutoffTime"
                  type="datetime-local"
                  value={endsAtStr}
                  onChange={(e) => setEndsAtStr(e.target.value)}
                  className="w-full p-2 border border-gray-300"
                />
              </div>

              <button onClick={handleLine} className="w-full p-2 text-white bg-black cursor-pointer hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/50" disabled={sendingRequest || changed <= 1}>
                Set/Update Line
              </button>
            </div>

          </div>
          <div className="p-6 border border-gray-300 mb-6">
            <div className="text-lg mb-4">Total Bets Placed</div>
            <div className="h-4 bg-gray-200 w-full">
              <div className="h-full bg-gray-600" style={{ width: `${yesRate}%` }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{yesCount} YES </span>
              <span>{total - yesCount} NO </span>
            </div>
          </div>
          <div className="border border-gray-200 p-6 mb-6">
            <h2 className="text-lg mb-4">Resolve Line</h2>

            <div>
              <div className="mb-4">
                <label htmlFor="winningSide" className="block mb-2 text-sm">
                  Winning Side (YES/NO)
                </label>
                <select
                  id="winningSide"
                  value={winningSide}
                  onChange={(e) => setWinningSide(e.target.value)}
                  className="w-full p-2 border border-gray-300"
                >
                  <option value="">Select winning side</option>
                  <option value="yes">YES</option>
                  <option value="no">NO</option>
                </select>
              </div>

              <button onClick={handleResolve} className="w-full p-2 text-white bg-black cursor-pointer hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/50" disabled={sendingRequest || !_id}>
                Resolve Line
              </button>
            </div>
          </div>
        </>}

      <BetTable userBets={userBets} username="admin" adminPage />
    </div>
  )
}
