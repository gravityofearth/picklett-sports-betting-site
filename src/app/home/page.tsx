"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import jwt from "jsonwebtoken"
import axios, { AxiosError } from "axios"
import { BetType, LineType } from "@/types"
import { convertAmerican2DecimalOdds, convertTimestamp2HumanReadablePadded, showToast } from "@/utils"


export default function HomePage() {
  const [username, setUsername] = useState("")
  const [balance, setBalance] = useState<number>(0) // Mock balance
  const [amount, setAmount] = useState("")
  const [side, setSide] = useState<"yes" | "no" | null>(null)
  const [oddsFormat, setOddsFormat] = useState<"american" | "decimal">("decimal")
  const [timeRemaining, setTimeRemaining] = useState("")
  const router = useRouter()
  const [line, setLine] = useState<LineType | null>(null)
  const [sendingBetRequest, setSendingBetRequest] = useState(false)
  const [userBets, setUserBets] = useState<BetType[]>([])
  
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

  const logout = () => {
    localStorage.removeItem("jwt")
    router.push("/login")
  }
  const updateBalance = () => {
    setBalance((jwt.decode(localStorage.getItem("jwt")!) as any)?.balance || 0)
    const storedUsername = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
    if (!storedUsername) {
      router?.push("/login")
      return
    }
    setUsername(storedUsername)
  }
  useEffect(() => {
    axios.get("/api/line", { headers: { token: localStorage.getItem("jwt") } }).then(({ data: { line, token } }) => {
      setLine(line)
      localStorage.setItem("jwt", token)
      updateBalance()
    })
    axios.get("/api/bet", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { bet } }) => {
        setUserBets(bet)
      })
    updateBalance()

  }, [])
  useEffect(() => {
    // Mock countdown timer
    const interval = setInterval(() => {
      // Just for demo purposes
      const timestampDiff = (line?.endsAt || 0) - Math.floor(new Date().getTime())
      setTimeRemaining(convertTimestamp2HumanReadablePadded(timestampDiff))

      if (timestampDiff < 0) {
        clearInterval(interval)
        return
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [line?.endsAt])

  const handleBet = () => {
    if (!line) {
      showToast("Betting line not found", "warn")
      return
    }
    const timestampDiff = (line?.endsAt || 0) - Math.floor(new Date().getTime())
    if (timestampDiff < 0) {
      showToast("Bet already ended", "warn")
      return
    }
    if (!side) {
      showToast("Select bet side", "warn")
      return
    }
    if (amount?.trim() === "") {
      showToast("Enter amount", "warn")
      return
    }
    if (amount && parseFloat(amount) > balance) {
      showToast("Invalid amount", "warn")
      return
    }
    setSendingBetRequest(true)
    const amountInNumber = parseFloat(amount)
    axios.post("/api/bet", {
      lineId: line._id,
      side,
      amount: amountInNumber
    }, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ status, data: { bet, token } }) => {
        if (status === 201) {
          showToast("Successfully placed your bet", "success")
        }
        setUserBets(v => ([...v, bet]))
        localStorage.setItem("jwt", token)
        updateBalance()
        setSendingBetRequest(false)
      })
      .catch((e: AxiosError) => {
        showToast(e.response?.statusText, "error")
        setSendingBetRequest(false)
      })
  }
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between mb-6">
        <div className="flex flex-col gap-2">
          <span className="text-2xl">Welcome, {username}</span>
          <div>Balance: ${balance.toFixed(2)}</div>
        </div>
        <button className="cursor-pointer" onClick={logout}>Logout</button>
      </div>

      {line ?
        <>
          <div className="border border-gray-200 p-6 mb-6">
            <h2 className="text-lg mb-4 text-center">{line?.question}</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm"> </div>
                <div className="flex items-center gap-2">
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

              <div className="flex gap-4 mb-4">
                <button onClick={() => setSide("yes")} className={`flex-1 p-3 border border-gray-300 cursor-pointer hover:border-black/50 ${side === "yes" && "bg-black/70 text-white"}`}>
                  YES {oddsFormat === "american" ? `(${line?.yes})` : `(${convertAmerican2DecimalOdds(line?.yes || 0)})`}
                </button>
                <button onClick={() => setSide("no")} className={`flex-1 p-3 border border-gray-300 cursor-pointer hover:border-black/50 ${side === "no" && "bg-black/70 text-white"}`}>
                  NO {oddsFormat === "american" ? `(${line?.no})` : `(${convertAmerican2DecimalOdds(line?.no || 0)})`}
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mb-4 w-[50%]">
                <label htmlFor="wager" className="block mb-2 text-sm">
                  Enter Amount
                </label>
                <input
                  id="wager"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300"
                  min="1"
                  max={balance}
                  step="0.01"
                />
              </div>
              <div className="w-[50%] flex flex-col items-end">
                <div className="mb-2 text-sm">Est. Payout</div>
                <div className="flex items-center text-4xl">
                  {amount && side &&
                    (side === "yes" ?
                      (parseFloat(amount) * convertAmerican2DecimalOdds(line?.yes || 0)) :
                      parseFloat(amount) * convertAmerican2DecimalOdds(line?.no || 0)
                    ).toFixed(2)
                  }
                </div>
              </div>
            </div>

            <button onClick={handleBet}
              className="w-full p-2 text-white bg-black mb-4 hover:bg-black/80 cursor-pointer disabled:cursor-not-allowed" disabled={sendingBetRequest}>
              Place Bet
            </button>

            <div className="text-center mb-2">Time remaining: {timeRemaining}</div>


          </div>

        </> : <div className="mb-4 text-center">No current active betting</div>

      }

      <div className="border border-gray-200 p-6">

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
      <div className="flex justify-center gap-4 my-4">
        <button onClick={() => router.push("/deposit")} className="px-4 py-2 border border-gray-300">
          Deposit
        </button>
        <button onClick={() => router.push("/withdraw")} className="px-4 py-2 border border-gray-300">
          Withdraw
        </button>
      </div>

    </div>
  )
}
