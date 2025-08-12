"use client"
import { convertAmerican2DecimalOdds, convertDecimal2AmericanOdds, showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BetType, LineCardAdminType, LineType } from "@/types"
import BetTable from "@/components/BetTable"
import Link from "next/link"

const rawLine: LineType & LineCardAdminType = {
  _id: "new",
  changed: 0,
  question: "",
  endsAt: new Date().getTime() + 24 * 60 * 60 * 1000,
  endsAtStr: `${new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString("sv-SE")}T${new Date().toLocaleTimeString("sv-SE")}`,
  yes: 1,
  yes_american: "",
  yes_decimal: "",
  no: 1,
  no_american: "",
  no_decimal: "",
  oddsFormat: "decimal",
  result: "pending",
  winning_side: "",
  createdAt: "",
}
export default function AdminPage() {
  const [lines, _setLines] = useState<(LineType & LineCardAdminType)[]>([rawLine])
  const setLines: React.Dispatch<React.SetStateAction<(LineType & LineCardAdminType)[]>> = (update) => {
    if (typeof update === 'function') {
      _setLines(prev => {
        const newVal = (update as (prev: (LineType & LineCardAdminType)[]) => (LineType & LineCardAdminType)[])(prev);
        return [
          newVal.filter(v => v._id === "new")[0],
          ...newVal.filter(v => v._id !== "new").sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        ];
      });
    } else {
      _setLines([
        update.filter(v => v._id === "new")[0],
        ...update.filter(v => v._id !== "new").sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      ]);
    }
  };
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [userBets, setUserBets] = useState<BetType[]>([])
  const [yesRate, setYesRate] = useState(50)
  const handleLine = (_id: string) => {
    setSendingRequest(true);

    const selectedLine = lines.filter(v => v._id === _id)[0];
    (_id === "new" ? axios.post : axios.put)("/api/line", {
      question: selectedLine.question,
      yes: selectedLine.yes,
      no: selectedLine.no,
      endsAt: selectedLine.endsAt,
      _id
    }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ status, data: { lines: returned_lines } }: { status: number, data: { lines: LineType[] } }) => {
        setLines([
          rawLine,
          ...returned_lines.map(v => ({
            ...v,
            yes_decimal: `${v.yes}`,
            no_decimal: `${v.no}`,
            yes_american: `${convertDecimal2AmericanOdds(v.yes)}`,
            no_american: `${convertDecimal2AmericanOdds(v.no)}`,
            endsAtStr: `${new Date(v.endsAt || 0).toLocaleDateString("sv-SE")}T${new Date(v.endsAt || 0).toLocaleTimeString("sv-SE")}`,
            oddsFormat: "decimal" as "american" | "decimal",
            changed: 0,
            winning_side: "",
          }))
        ])
        if (status === 201) {
          showToast("Successfully created betting line!", "success")
        }
        if (status === 202) {
          showToast("Successfully updated betting line!", "success")
        }
      })
      .catch((e: AxiosError) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      }).finally(() => setSendingRequest(false))
  }

  const handleResolve = (_id: string) => {
    if (_id === "new") return
    const selectedLine = lines.filter(v => v._id === _id)[0];
    if (selectedLine.winning_side?.trim() === "") {
      showToast("Select winning side", "warn")
      return
    }
    setSendingRequest(true)
    axios.post("/api/bet/resolve", { lineId: _id, winningSide: selectedLine.winning_side }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ status }) => {
        if (status === 200) {
          showToast("Successfully resolved betting", "success")
        }
        fetchData()
      })
      .catch(e => {
        showToast(e.response?.statusText || "Unknown Error", "error")
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
      .then(({ data: { lines: returned_lines, token } }: { data: { lines: LineType[], token: string } }) => {
        const newLine = lines.filter(v => v._id === "new")[0]
        if (returned_lines) {
          setLines([newLine,
            ...returned_lines.map(v => ({
              ...v,
              yes_decimal: `${v.yes}`,
              no_decimal: `${v.no}`,
              yes_american: `${convertDecimal2AmericanOdds(v.yes)}`,
              no_american: `${convertDecimal2AmericanOdds(v.no)}`,
              endsAtStr: `${new Date(v.endsAt || 0).toLocaleDateString("sv-SE")}T${new Date(v.endsAt || 0).toLocaleTimeString("sv-SE")}`,
              oddsFormat: "decimal" as "american" | "decimal",
              changed: 0,
              winning_side: "",
            }))])
        } else {
          setLines([newLine])
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
          <div className="grid grid-cols-2 gap-4 pb-6">
            {lines.map((line) =>
              <div key={line._id} className="w-full border border-gray-200 p-6">
                <div className="">
                  {/* <h2 className="text-lg mb-4">Set Betting Line</h2> */}
                  <div>
                    <div className="mb-4">
                      <label htmlFor="question" className="block mb-2 text-lg">
                        Question
                      </label>
                      <input
                        id="question"
                        type="text"
                        value={line.question}
                        onChange={(e) => setLines(prevLines => ([
                          ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                          {
                            ...line,
                            question: e.target.value,
                            changed: 1,
                          }
                        ]))}
                        className="w-full p-2 border border-gray-300"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="col-span-1">
                        <label htmlFor="yesOdds" className="block mb-2 text-sm">
                          Yes Odds
                        </label>
                        {line.oddsFormat === "decimal" ?
                          <input
                            id="yesOdds"
                            type="text"
                            value={line.yes_decimal}
                            onChange={(e) => setLines(prevLines => ([
                              ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                              {
                                ...line,
                                yes_decimal: e.target.value,
                                changed: 1,
                                yes: Number(e.target.value),
                              }
                            ]))}
                            className="w-full px-2 border border-gray-300"
                            placeholder="1.8"
                          /> :
                          <input
                            id="yesOdds"
                            type="text"
                            value={line.yes_american}
                            onChange={(e) => setLines(prevLines => ([
                              ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                              {
                                ...line,
                                yes_american: e.target.value,
                                changed: 1,
                                yes: convertAmerican2DecimalOdds(Number(e.target.value))
                              }
                            ]))}
                            className="w-full px-2 border border-gray-300"
                            placeholder="-110"
                          />
                        }
                      </div>

                      <div className="col-span-1">
                        <label htmlFor="noOdds" className="block mb-2 text-sm">
                          No Odds
                        </label>
                        {line.oddsFormat === "decimal" ?
                          <input
                            id="noOdds"
                            type="text"
                            value={line.no_decimal}
                            onChange={(e) => setLines(prevLines => ([
                              ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                              {
                                ...line,
                                no_decimal: e.target.value,
                                changed: 1,
                                no: Number(e.target.value),
                              }
                            ]))}
                            className="w-full px-2 border border-gray-300"
                            placeholder="1.2"
                          /> :
                          <input
                            id="noOdds"
                            type="text"
                            value={line.no_american}
                            onChange={(e) => setLines(prevLines => ([
                              ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                              {
                                ...line,
                                no_american: e.target.value,
                                changed: 1,
                                no: convertAmerican2DecimalOdds(Number(e.target.value)),
                              }
                            ]))}
                            className="w-full px-2 border border-gray-300"
                            placeholder="-180"
                          />
                        }
                      </div>
                      <div className="flex flex-col col-span-1 items-end gap-2">
                        <span className="text-sm">Odds format:</span>
                        <select
                          id="odd-selector"
                          value={line.oddsFormat}
                          onChange={(e) => setLines(prevLines => ([
                            ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                            {
                              ...line,
                              oddsFormat: e.target.value as "american" | "decimal",
                              yes: e.target.value === "american" ? Number(line.yes_decimal) : convertAmerican2DecimalOdds(Number(line.yes_american)),
                              no: e.target.value === "american" ? Number(line.no_decimal) : convertAmerican2DecimalOdds(Number(line.no_american)),
                              yes_decimal: e.target.value === "decimal" ? `${convertAmerican2DecimalOdds(Number(line.yes_american))}` : line.yes_decimal,
                              no_decimal: e.target.value === "decimal" ? `${convertAmerican2DecimalOdds(Number(line.no_american))}` : line.no_decimal,
                              yes_american: e.target.value === "american" ? `${convertDecimal2AmericanOdds(Number(line.yes_decimal))}` : line.yes_american,
                              no_american: e.target.value === "american" ? `${convertDecimal2AmericanOdds(Number(line.no_decimal))}` : line.no_american,
                            }
                          ]))}
                          className="text-sm px-1 border border-gray-300 w-full h-[26px]"
                        >
                          <option value="decimal">Decimal</option>
                          <option value="american">American</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="cutoffTime" className="block mb-2 text-sm">
                        Cutoff Time ({Intl.DateTimeFormat().resolvedOptions().timeZone} {new Date().toLocaleTimeString('en-US', { timeZoneName: 'longOffset' }).split(' ').pop()})
                      </label>
                      <input
                        id="cutoffTime"
                        type="datetime-local"
                        value={line.endsAtStr}
                        onChange={(e) => setLines(prevLines => ([
                          ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                          {
                            ...line,
                            endsAtStr: e.target.value,
                            changed: 1,
                            endsAt: (new Date(e.target.value)).getTime(),
                          }
                        ]))}
                        className="w-full p-2 border border-gray-300"
                      />
                    </div>

                    <button onClick={() => handleLine(line._id)} className="w-full p-2 text-white bg-black cursor-pointer hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/50" disabled={sendingRequest || line.changed < 1}>
                      {line._id === "new" ? "+ Create" : "Update"} Line
                    </button>
                  </div>

                </div>
                {line._id !== "new" &&
                  <>
                    <hr className="w-full my-6 border-gray-400" />
                    <div className="">
                      {/* <div className="text-lg mb-4">Total Bets Placed</div> */}
                      <div className="h-4 bg-gray-200 w-full">
                        <div className="h-full bg-gray-600" style={{ width: `${yesRate}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>{yesCount} YES </span>
                        <span>{total - yesCount} NO </span>
                      </div>
                    </div>
                    <hr className="w-full my-6 border-gray-400" />
                    <div className="">
                      {/* <h2 className="text-lg mb-4">Resolve Line</h2> */}

                      <div className="flex items-end gap-4">
                        <div className="w-full">
                          <label htmlFor="winningSide" className="block mb-2 text-sm">
                            Winning Side (YES/NO)
                          </label>
                          <select
                            value={line.winning_side}
                            onChange={(e) => setLines(prevLines => ([
                              ...prevLines.filter(filteringLine => filteringLine._id !== line._id),
                              {
                                ...line,
                                winning_side: e.target.value,
                              }
                            ]))}
                            className="w-full p-2 border border-gray-300"
                          >
                            <option value="">Select winning side</option>
                            <option value="yes">YES</option>
                            <option value="no">NO</option>
                          </select>
                        </div>

                        <button onClick={() => handleResolve(line._id)} className="w-full p-2 h-[37px] text-white bg-black cursor-pointer hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/50" disabled={sendingRequest || line._id === "new"}>
                          Resolve Line
                        </button>
                      </div>
                    </div>
                  </>
                }
              </div>
            )}

          </div>
        </>}

      <BetTable userBets={userBets} username="admin" adminPage />
    </div>
  )
}
