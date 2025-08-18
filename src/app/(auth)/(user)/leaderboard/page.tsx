"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import LeaderTable from "@/components/LeaderTable"
import { LeaderType } from "@/types"
export default function HomePage() {
  const [leaders, setLeaders] = useState<LeaderType[]>([])
  useEffect(() => {
    axios.get('/api/leaders').then(({ data: { leaders } }) => {
      setLeaders(leaders)
    })
  }, [])
  return (
    <>
      <div className="flex flex-col items-center gap-6">
        <div className="text-center text-lg p-4 border-4 border-gray-300 border-double"><span className="underline font-bold">Leaderboard & Rewards<br/></span>
        Stay on top of the action with our live leaderboard, showcasing players on winning streaks of 2 or more. Aim higher to unlock instant exclusive bonuses straight to your balance from $50 at 5 wins, to $250 at 10 wins. The more you win, the greater the rewards. (You dont need to bet on every game, just choose the ones you have confidence in!)</div>
        <div className="border border-gray-200 p-6 w-1/2">
          <h2 className="text-lg mb-4 text-center">Reward Table</h2>
          <div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Winstreak</th>
                  <th className="p-2 text-left">Bonus</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">5 winstreak</td>
                  <td className="p-2">$50</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">7 winstreak</td>
                  <td className="p-2">$100</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">10 winstreak</td>
                  <td className="p-2">$250</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <LeaderTable leaders={leaders} />
    </>
  )
}
