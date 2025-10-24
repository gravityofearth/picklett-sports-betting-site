"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation";

export default function Page({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-10 max-md:gap-4">
        <Link href="../../clan-wars" className="flex gap-2 items-center cursor-pointer hover:underline">
          <svg className="w-6 h-6 fill-white"><use href="#svg-left-arrow" /></svg>
          <span className="md:text-2xl leading-6 max-md:leading-4 select-none">Back to Clan</span>
        </Link>
        <div className="w-full flex flex-col items-center gap-6 p-6 rounded-2xl bg-[#1475E1]/10">
          <div className="flex gap-1 items-center">
            <svg className="w-8 h-8 max-md:w-6 max-md:h-6 fill-white"><use href="#svg-clan-war" /></svg>
            <span className="md:text-xl leading-6">24h Wins War</span>
          </div>
          <div className="w-full px-6 flex justify-between items-center">
            <div className="flex flex-col items-center gap-2">
              <Image alt="avatar" src={`/api/profile/avatar-todo`} width={64} height={64} className="shrink-0 rounded-full max-md:rounded-lg w-[64px] max-md:w-10 h-[64px] max-md:h-10" />
              <span className="md:text-2xl leading-6 text-nowrap">Elite Bettors</span>
              <span className="text-[20px] font-semibold leading-12 max-md:leading-6">12</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Image alt="vs" src="/vs.png" width={80} height={80} className="shrink-0 rounded-full w-[80px] h-[80px] max-md:w-6 max-md:h-6" />
              <div className="max-md:hidden flex gap-2 items-center py-1 px-2 bg-[#1475E1]/20 rounded-lg">
                <svg className="w-6 h-6"><use href="#svg-clan-coffer" /></svg>
                <div className="text-xl text-white/70">Stake: <span className="text-white ">$2000</span></div>
              </div>
              <div className="flex gap-2 items-center py-1 px-2 bg-[#1475E1]/20 rounded-lg">
                <svg className="w-6 h-6 max-md:hidden"><use href="#svg-clan-coffer" /></svg>
                <div className="md:text-xl text-white text-nowrap"><span className="text-white/70 max-md:hidden">Winner takes: </span>$4000</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Image alt="avatar" src={`/api/profile/avatar-todo`} width={64} height={64} className="shrink-0 rounded-full max-md:rounded-lg w-[64px] max-md:w-10 h-[64px] max-md:h-10" />
              <span className="md:text-2xl leading-6 text-nowrap">Elite Bettors</span>
              <span className="text-[20px] font-semibold leading-12 max-md:leading-6">12</span>
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
