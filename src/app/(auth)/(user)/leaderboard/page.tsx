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
      <div className="flex flex-col items-center">
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
        </div></div>
      <LeaderTable leaders={leaders} />
    </>
  )
}
