"use client"

import { getWinRate, showToast } from "@/utils"
import { useClan } from "../layout"
import { useUser } from "@/store"
import axios from "axios"
import { useState } from "react"

export default function Page() {
  const { pendingMembers, clan, fetchClan } = useClan()
  const { clan: userClan } = useUser()
  const [sending, setSending] = useState(false)
  const handleRequest = (username: string, isApprove: boolean) => {
    if (!clan) return
    setSending(true)
    axios.post(`/api/clan/join/resolve-pending`, { id: clan._id, username, isApprove }, { headers: { token: localStorage.getItem("jwt") } })
      .then(() => {
        showToast("Operation succeeded", "success")
        fetchClan()
      }).catch((e) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      }).finally(() => setSending(false))
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="md:text-2xl">Pending Members</div>
        <div className="p-2 flex max-md:flex-col gap-2 px-4 rounded-lg border border-white/10 bg-[#1C2534]">
          <div className="flex gap-1 items-center">
            <svg className="w-4 h-4"><use href="#svg-tip" /></svg>
            <span className="">Tip</span>
          </div>
          <span>Review member stats and win rates before approving. You can also check their social profiles to verify authenticity.</span>
        </div>
      </div>
      <div className="max-md:hidden w-full bg-[#0E1B2F] p-4 rounded-3xl">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 text-lg">
              <th className="pl-3 py-6 pr-2 text-left font-normal rounded-l-2xl">Applicant</th>
              <th className="pl-3 py-6 pr-2 text-left font-normal">Win Rate</th>
              <th className="pl-3 py-6 pr-2 text-left font-normal">Total Bets</th>
              <th className="pl-3 py-6 pr-2 text-left font-normal">Earnings</th>
              <th className="pl-3 py-6 pr-2 text-left font-normal">Request Time</th>
              <th className="pl-1 py-6 pr-2 text-left font-normal rounded-r-2xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingMembers.map((member, i) =>
              <tr key={i} className="">
                <td className="pl-3 py-6 pr-2"> {member.username} </td>
                <td className="pl-3 py-6 pr-2"> {getWinRate({ wins: member.wins, bets: member.bets })} </td>
                <td className="pl-3 py-6 pr-2"> {member.bets} </td>
                <td className="pl-3 py-6 pr-2 font-bold"> ${member.earns.toFixed(2)} </td>
                <td className="pl-3 py-6 pr-2 font-bold"> {new Date(member.clan.timestamp).toLocaleString("en-US", { year: "numeric", month: "numeric", day: "numeric", hour: 'numeric', minute: 'numeric', hour12: true })} </td>
                <td className="w-[200px]">
                  {userClan && userClan.joined && userClan.role === "owner" && clan?._id === userClan.clanId &&
                    <div className="flex gap-2">
                      <button disabled={sending} onClick={() => handleRequest(member.username, true)} className="py-3 px-6 bg-[#1475E1] rounded-lg cursor-pointer hover:bg-[#3e87da] disabled:cursor-not-allowed">Approve</button>
                      <button disabled={sending} onClick={() => handleRequest(member.username, false)} className="py-3 px-6 bg-[#FEE2E2] rounded-lg cursor-pointer hover:bg-[#f8c7c7] text-[#EF4444] disabled:cursor-not-allowed">Reject</button>
                    </div>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pendingMembers.map((member, i) =>
        <div key={i} className="md:hidden p-6 max-md:p-3 rounded-2xl max-md:rounded-lg w-full bg-[#1475E1]/10 flex flex-col gap-4">
          <div className="text-[32px] leading-12 max-md:text-[18px] max-md:leading-4">{member.username}</div>
          <div className="flex justify-between gap-4">
            <div className="text-sm flex gap-1 items-center"><span className="text-white/70">Total Bets </span><span>{member.bets}</span></div>
            <div className="text-sm flex gap-1 items-center"><span className="text-white/70">Earning </span><span>${member.earns}</span></div>
            <div className="text-sm flex gap-1 items-center"><span className="text-white/70">Win rate </span><span>{getWinRate({ wins: member.wins, bets: member.bets })}</span></div>
          </div>
          <div className="text-sm text-center w-full"><span className="text-white/70">Requested Time </span>
            <span>{new Date(member.clan.timestamp).toLocaleString("en-US", { year: "numeric", month: "numeric", day: "numeric", hour: 'numeric', minute: 'numeric', hour12: true })}</span>
          </div>
          {userClan && userClan.joined && userClan.role === "owner" && clan?._id === userClan.clanId &&
            <div className="flex gap-2 w-full">
              <button className="py-3 px-6 max-md:p-2 max-md:text-sm bg-[#1475E1] rounded-lg w-full cursor-pointer hover:bg-[#3e87da]">Approve</button>
              <button className="py-3 px-6 max-md:p-2 max-md:text-sm bg-[#FEE2E2] rounded-lg w-full cursor-pointer hover:bg-[#f8c7c7] text-[#EF4444]">Reject</button>
            </div>
          }
        </div>
      )}
    </div>
  )
}

