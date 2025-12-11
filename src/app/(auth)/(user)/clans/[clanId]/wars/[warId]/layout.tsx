"use client"

import { ClansInWarType, PendingBetsType, WarType } from "@/types";
import axios from "axios";
import Image from "next/image"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Page({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams()
  const pathname = usePathname()
  const [war, setWar] = useState<WarType>()
  const percentReal = useMemo(() => {
    if (!war?.clans) return 50
    const total = war.clans[0].wins + war.clans[1].wins
    if (total === 0) return 50
    return Math.floor(war.clans[0].wins / total * 100)
  }, [war])
  const percent = useMemo(() => Math.min(90, Math.max(10, percentReal)), [percentReal])
  const [timing, setTiming] = useState("")
  useEffect(() => {
    axios.get(`/api/clan/war/${params.warId}`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { war } }) => {
        setWar(war)
      })
  }, [])
  useEffect(() => {
    if (!war) return
    const t = setInterval(() => {
      if (Date.now() < war.startsAt) {
        setTiming("Waiting...")
      } else if (Date.now() - war.startsAt < 24 * 60 * 60 * 1000) {
        const seconds = Math.floor((24 * 60 * 60 * 1000 + war.startsAt - Date.now()) / 1000)
        const h = Math.floor(seconds / 3600).toString().padStart(2, "0")
        const m = (Math.floor(seconds / 60) % 60).toString().padStart(2, "0")
        const s = (seconds % 60).toString().padStart(2, "0")
        setTiming(`Ends in ${h}:${m}:${s}`)
      } else {
        setTiming("Ended")
      }
    }, 1000);
    return () => clearInterval(t)
  }, [war])
  if (!war) return null
  return (
    <div className="flex justify-center">
      <div className="w-full flex flex-col gap-10 max-md:gap-4">
        <Link href="../../clan-wars" className="flex gap-2 items-center cursor-pointer hover:underline">
          <svg className="w-6 h-6 fill-white"><use href="#svg-left-arrow" /></svg>
          <span className="md:text-2xl leading-6 max-md:leading-4 select-none">Back to Clan</span>
        </Link>
        <div className="w-full flex flex-col items-center gap-6 p-6 max-md:p-1 rounded-2xl bg-[#1475E1]/10">
          <div className="flex gap-1 items-center">
            <svg className="w-8 h-8 max-md:w-6 max-md:h-6 fill-white"><use href="#svg-clan-war" /></svg>
            <span className="md:text-xl leading-6">24h Wins War</span>
          </div>
          {new Date(war.startsAt).toLocaleDateString()} - {new Date(war.startsAt + 24 * 60 * 60 * 1000).toLocaleDateString()}
          <div className="w-full px-6 max-md:p-0 flex max-md:flex-col justify-between items-center">
            <ClanItem clan={war.clans?.[0]} pendingBets={war.pendingBets} />
            <div className="flex flex-col items-center gap-2">
              <Image alt="vs" src="/vs.png" width={80} height={80} className="shrink-0 rounded-full w-[80px] h-[80px] max-md:w-6 max-md:h-6" />
              <div className="max-md:hidden flex gap-2 items-center py-1 px-2 bg-[#1475E1]/20 rounded-lg">
                <svg className="w-6 h-6"><use href="#svg-clan-coffer" /></svg>
                <div className="text-xl text-white/70">Stake: <span className="text-white ">${war.stake}</span></div>
              </div>
              <div className="max-md:hidden flex gap-2 items-center py-1 px-2 bg-[#1475E1]/20 rounded-lg">
                <svg className="w-6 h-6 max-md:hidden"><use href="#svg-clan-coffer" /></svg>
                <div className="md:text-xl text-white text-nowrap"><span className="text-white/70 max-md:hidden">Winner takes: </span>${war.prize}</div>
              </div>
            </div>
            <ClanItem clan={war.clans?.[1]} pendingBets={war.pendingBets} />
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4"><use href="#svg-clock" /></svg>
            <span className="text-white/70 max-md:text-xs">{timing}</span>
          </div>
          <div className="w-full h-[30px] max-md:h-4 flex relative overflow-hidden">
            <div className="absolute inset-0 z-10" style={{ translate: `${percent}% 0` }}>
              <p className="w-fit h-full text-[18px] max-md:text-[10px] -translate-x-[50%] bg-linear-to-r from-[#2665c6] to-[#bb3a06]">{percentReal}% {100 - percentReal}%</p>
            </div>
            <div className="h-full bg-[#1475E1] rounded-l-full" style={{ width: `${percent}%` }}>
              <div className="bg-[url(/clan-war-progress-bar-blue.png)] bg-right w-full h-full rounded-l-full opacity-50"></div>
            </div>
            <div className="h-full bg-[#E44C1F] rounded-r-full" style={{ width: `${100 - percent}%` }}>
              <div className="bg-[url(/clan-war-progress-bar-red.png)] bg-left w-full h-full rounded-r-full opacity-60"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 max-md:gap-2">
          <span className="text-2xl max-md:text-sm">Recent War Activity</span>
          <div className="flex gap-3">
            <Link href="feed" className={`px-4 py-2 max-md:px-2 max-md:py-1 max-md:text-sm flex items-center gap-2 select-none rounded-xl cursor-pointer ${pathname.includes("/feed") ? "bg-[#1475E1]" : "bg-white/10"} `}>
              Feed
            </Link>
            <Link href="rule" className={`px-4 py-2 max-md:px-2 max-md:py-1 max-md:text-sm flex items-center gap-2 select-none rounded-xl cursor-pointer ${pathname.includes("/rule") ? "bg-[#1475E1]" : "bg-white/10"} `}>
              War Rules
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
const ClanItem = ({ clan, pendingBets }: { clan?: ClansInWarType, pendingBets: PendingBetsType }) => {
  if (!clan) return null
  const inPlays = pendingBets.filter(b => clan.members.includes(b.username)).length
  return (
    <div className="flex flex-col items-center gap-2 w-[300px]">
      <Image alt="avatar" src={`/api/profile/avatar/${clan.icon}`} width={64} height={64} className="shrink-0 rounded-full max-md:rounded-lg w-[64px] max-md:w-10 h-[64px] max-md:h-10" />
      <span className="md:text-2xl leading-6 text-nowrap">{clan.title}</span>
      <span className="text-[20px] font-semibold max-md:leading-6">{clan.wins} Wins</span>
      <span className="text-[16px] font-semibold max-md:leading-6">({inPlays} In Play)</span>
    </div>
  )
}