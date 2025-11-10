"use client"

import { useUser } from "@/store"
import { ClanType } from "@/types"
import { getWinRate } from "@/utils"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

export default function ClansPage() {
  const [clans, setClans] = useState<ClanType[]>([])
  const { clan: userClan } = useUser()

  const sortedClans = useMemo(() => {
    const sort_clans = clans.map((v, i) => ({ ...v, rank: i + 1 }))
    const myClan = sort_clans.find(v => v._id === userClan?.clanId)
    const otherClans = sort_clans.filter(v => v._id !== userClan?.clanId)
    return myClan ?
      [myClan, ...otherClans] :
      otherClans
  }, [clans, userClan])

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    if (!isClient) return
    if (!localStorage.getItem("jwt")) return
    axios.get(`/api/clan`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { clans } }) => {
        setClans(clans)
      })
  }, [isClient])
  return (
    <div className="flex justify-center">
      <div className="w-full flex flex-col gap-8">
        <div className="flex max-md:flex-col justify-between items-start">
          <div className="flex flex-col">
            <div className="flex gap-3 py-3">
              <svg className="w-6 h-6"><use href="#svg-clan" /></svg>
              <span className="text-[18px]">Clans</span>
            </div>
            <div className="leading-12 max-md:leading-5 max-md:text-sm">Join forces, challenge rivals, and dominate together</div>
            <div className="text-sm max-md:text-xs text-[#F59E0B]">
              <p>
                <span className="font-bold">Join or build your own clan</span> to unlock shared
                <Link href="/clans/info" className="italic underline"> global perks</Link>,
                boosted odds, and exclusive tournaments.
              </p>
              <p>Each time you win a bet, <span className="font-bold">0.1% of your winnings goes to your clan's coffer</span> — fueling bigger rewards for everyone.</p>
              <p><span className="font-bold">Level up together</span> and enter epic Clan Wars — from 24-hour skirmishes to week-long battles for massive prize pools.</p>
            </div>
          </div>
          {!userClan?.joined &&
            <Link href={userClan?.joined ? "#" : "/clans/new"} className={`flex gap-2 items-center mt-3 py-4 px-6 max-md:py-2 max-md:px-3 rounded-lg ${userClan?.joined ? "bg-[#063e7e]" : "bg-[#1475E1]"} cursor-pointer hover:bg-[#5796dd] select-none`}>
              <svg className="w-6 h-6 max-md:w-4 max-md:h-4"><use href="#svg-clan" /></svg>
              <span className="text-nowrap max-md:text-sm">Create Clan</span>
            </Link>
          }
        </div>
        <div className="flex flex-col gap-6 max-md:gap-2">
          <div className="flex flex-col gap-4 max-md:gap-2">
            <div className=" text-2xl leading-10 max-md:leading-5 max-md:text-lg">Clan Leaderboard</div>
            <div className="w-full bg-white/10 px-4 py-3 border border-white/20 flex gap-2 items-center rounded-lg max-md:text-sm max-md:p-2">
              <svg className="w-5 h-5"><use href="#svg-search" /></svg>
              <input placeholder="Search clan name" className="text-white/70 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-6">
            {sortedClans.map((clan, i) =>
              <div key={i} className="relative p-6 max-md:p-4 rounded-2xl w-full bg-[#1475E1]/10 flex flex-col gap-4">
                {userClan?.clanId === clan._id &&
                  <div className="px-4 py-2 max-md:p-1 max-md:text-xs md:rounded-md bg-[#1475E1] absolute right-4 top-4 select-none">
                    {userClan?.joined ? "My Clan" : "Requested"}
                  </div>
                }
                <div className="flex gap-4 items-center">
                  <div className="md:hidden flex gap-2 items-center">
                    <svg className="w-6 h-6 stroke-[#F7E436]"><use href="#svg-crown-new" /></svg>
                    <span className=" text-white/80">Rank #{clan.rank}</span>
                  </div>
                  <Image alt="avatar" src={`/api/profile/avatar/${clan.icon}`} width={104} height={104} className="shrink-0 rounded-3xl w-[104px] h-[104px] max-md:w-8 max-md:h-8" />
                  <div className="flex flex-col gap-4">
                    <div className="text-[32px] leading-12 max-md:text-[18px] max-md:leading-4">{clan.title}</div>
                    <div className="flex gap-4 items-center max-md:hidden">
                      <div className="flex gap-2 items-center">
                        <svg className="w-6 h-6 stroke-[#F7E436]"><use href="#svg-crown-new" /></svg>
                        <span className=" text-white/80">Rank #{clan.rank}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <svg className="w-6 h-6"><use href="#svg-member" /></svg>
                        <span className=" text-white/80">{clan.members?.filter((m: any) => m.clan.joined)?.length}/50</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
                        <span className=" text-white/80"> {clan.wins} wins</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <svg className="w-6 h-6"><use href="#svg-clan-level" /></svg>
                        <span className=" text-white/80">{clan.level} Level</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="text-white/70 wrap-break-word">{clan.description}</div>
                  {/* <div className="text-[#F59E0B] max-md:hidden">Requirements: 60%+ win rate, 100+ bets placed</div> */}
                  <div className="flex justify-between md:hidden">
                    <div className="text-sm flex gap-2"><span className="text-white/70">Members </span><span>{clan.members?.filter((m: any) => m.clan.joined)?.length}</span></div>
                    <div className="text-sm flex gap-2"><span className="text-white/70">Wins </span><span>{clan.wins}</span></div>
                    <div className="text-sm flex gap-2"><span className="text-white/70">Win rate </span><span>{getWinRate({ bets: clan.bets, wins: clan.wins })}</span></div>
                  </div>
                </div>
                <Link href={`/clans/${clan._id}/members`} className="py-4 px-6 max-md:p-2 rounded-lg bg-[#1475E1] cursor-pointer hover:bg-[#5796dd]  text-center">View</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}