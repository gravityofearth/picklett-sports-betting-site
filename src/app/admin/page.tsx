"use client"

import jwt from "jsonwebtoken"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BetType } from "@/types"

export default function AdminPage() {
  const [question, setQuestion] = useState("")
  const router = useRouter()
  const [_id, set_id] = useState<undefined | string>(undefined)
  const [yes, setYes] = useState("")
  const [no, setNo] = useState("")
  const [endsAtStr, setEndsAtStr] = useState("0")
  const [endsAt, setEndsAt] = useState(0)
  const [result, setResult] = useState<"yes" | "no" | "pending" | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [userBets, setUserBets] = useState<BetType[]>([])
  const [yesRate, setYesRate] = useState(50)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  
  // Pagination logic
  const totalPages = Math.ceil(userBets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBets = userBets.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  
  useEffect(() => { setEndsAt((new Date(endsAtStr)).getTime()) }, [endsAtStr])
  const [winningSide, setWinningSide] = useState("")
  const handleLine = () => {
    setSendingRequest(true);
    (_id ? axios.put : axios.post)("/api/line", {
      question, yes, no, endsAt, result: "pending", _id
    }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ status, data: { line } }) => {
        setSendingRequest(false)
        if (status === 201) {
          showToast("Successfully created betting line!", "success")
        }
        if (status === 202) {
          showToast("Successfully updated betting line!", "success")
        }
      })
      .catch((e: AxiosError) => {
        setSendingRequest(false)
        showToast(e.response?.statusText, "error")
      })
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
        setSendingRequest(false)
        fetchData()
      })
      .catch(e => {
        setSendingRequest(false)
        showToast(e.response?.statusText, "error")
      })
  }
  const logout = () => {
    localStorage.removeItem("jwt")
    router.push("/login")
  }
  useEffect(() => {
    // Check if user is logged in
    const username = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
    if (!username || username !== "admin") {
      router.push("/login")
      return
    }
    setLoading(true)
    fetchData()
  }, [])
  useEffect(() => {
    const total = userBets.filter(v => v.status === "pending").length
    const yesCount = userBets.filter(v => v.status === "pending" && v.side === "yes").length
    const yesRate = Math.floor(yesCount * 100 / total)
    setYesRate(yesRate)
  }, [userBets])
  const fetchData = () => {
    axios.get("/api/line", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { line, token } }) => {
        if (line) {
          set_id(line._id)
          setQuestion(line.question)
          setYes(line.yes)
          setNo(line.no)
          setResult(line.result)
          setEndsAtStr(`${new Date(line.endsAt || 0).toLocaleDateString("sv-SE")}T${new Date(line.endsAt || 0).toLocaleTimeString("sv-SE")}`)
        } else {
          set_id(undefined)
          setQuestion("")
          setYes("")
          setNo("")
          setResult(null)
          setEndsAtStr(`${new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString("sv-SE")}T${new Date().toLocaleTimeString("sv-SE")}`)
        }
        localStorage.setItem("jwt", token)
        setLoading(false)
      })
      .catch(() => {
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
        <button className="cursor-pointer" onClick={logout}>Logout</button>
      </div>
      {loading ? "Loading..." :
        <>
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

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="yesOdds" className="block mb-2 text-sm">
                    Yes Odds
                  </label>
                  <input
                    id="yesOdds"
                    type="text"
                    value={yes}
                    onChange={(e) => setYes(e.target.value)}
                    className="w-full p-2 border border-gray-300"
                    placeholder="-110"
                  />
                </div>

                <div>
                  <label htmlFor="noOdds" className="block mb-2 text-sm">
                    No Odds
                  </label>
                  <input
                    id="noOdds"
                    type="text"
                    value={no}
                    onChange={(e) => setNo(e.target.value)}
                    className="w-full p-2 border border-gray-300"
                    placeholder="-110"
                  />
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

              <button onClick={handleLine} className="w-full p-2 text-white bg-black cursor-pointer hover:bg-black/80 disabled:cursor-not-allowed" disabled={sendingRequest}>
                Set/Update Line
              </button>
            </div>

          </div>
          <div className="p-6 border border-gray-300 mb-6">
            <div className="text-lg mb-4">Betting Rate</div>
            <div className="h-4 bg-gray-200 w-full">
              <div className="h-full bg-gray-600" style={{ width: `${yesRate}%` }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>YES {yesRate}%</span>
              <span>NO {100 - yesRate}%</span>
            </div>
          </div>
          <div className="border border-gray-200 p-6 mb-6">
            <h2 className="text-lg mb-4">Resolve Bet</h2>

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

              <button onClick={handleResolve} className="w-full p-2 text-white bg-black cursor-pointer hover:bg-black/80 disabled:cursor-not-allowed" disabled={sendingRequest}>
                Resolve Bet
              </button>
            </div>
          </div>
        </>}

      <div className="border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Bet History</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Username</th>
                <th className="p-2 text-left">Bet Amount</th>
                <th className="p-2 text-left">Bet Side</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentBets.map((bet, i) => (
                <tr key={startIndex + i} className="border-b">
                  <td className="p-2">{bet.username}</td>
                  <td className="p-2">${bet.amount.toFixed(2)}</td>
                  <td className="p-2">{bet.side}</td>
                  <td className="p-2">{bet.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {userBets.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, userBets.length)} of {userBets.length} bets
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 border ${
                    currentPage === page
                      ? "bg-black text-white border-black"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
