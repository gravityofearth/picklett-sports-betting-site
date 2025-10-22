"use client"

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function Page({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-8">
        <div className="w-full py-6 px-8 flex flex-col gap-8 rounded-2xl bg-[#1475E1]/10">
          <div className="flex gap-4">
            <Image alt="avatar" src={`/api/profile/avatar-todo`} width={104} height={104} className="shrink-0 rounded-3xl w-[104px] h-[104px]" />
            <div className="flex flex-col gap-2">
              <div className="text-[40px] font-medium">Elite Bettors</div>
              <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center">
                  <svg className="w-6 h-6"><use href="#svg-crown-new" /></svg>
                  <span className="font-medium text-white/80">Rank #1</span>
                </div>
                <div className="flex gap-2 items-center">
                  <svg className="w-6 h-6"><use href="#svg-member" /></svg>
                  <span className="font-medium text-white/80">48/50</span>
                </div>
              </div>
              <div className="text-sm max-w-3xl">
                Our clan is more than just a group — it's a family built on teamwork, respect, and determination. We play with passion, compete with strategy, and grow together through every victory and defeat.
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-4">
            <ClanCard icon="#svg-clan-level" title="Clan Level" value="8">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="text-white/70 font-medium">XP Progress</div>
                  <div className="text-[#1475E1] font-semibold">83%</div>
                </div>
                <div className="w-full h-2 bg-[#1475E1]/20 rounded-full">
                  <div className="w-1/2 bg-[#1475E1] h-full rounded-full"></div>
                </div>
              </div>
            </ClanCard>
            <ClanCard icon="#svg-clan-coffer" title="Coffer Balance" value="$15200">
              <div className="flex gap-2 h-full items-center">
                <div className="flex gap-1 items-center">
                  <svg className="w-6 h-6"><use href="#svg-chart-new" /></svg>
                  <span className="text-sm text-[#22C55E] font-medium">+12.5%</span>
                </div>
                <div className="text-sm text-white/70">vs last week</div>
              </div>
            </ClanCard>
            <ClanCard icon="#svg-member" title="Active Members" value="45/50">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="text-white/70 font-medium">5 Slots left</div>
                  <div className="flex">
                    <div className="flex items-center justify-center w-[22px] h-[22px] translate-x-[160%] z-40 bg-white rounded-full">
                      <Image alt="avatar" src={`/api/profile/avatar-todo`} width={20} height={20} className="shrink-0 rounded-3xl w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-center w-[22px] h-[22px] translate-x-[120%] z-30 bg-white rounded-full">
                      <Image alt="avatar" src={`/api/profile/avatar-todo`} width={20} height={20} className="shrink-0 rounded-3xl w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-center w-[22px] h-[22px] translate-x-[80%] z-20 bg-white rounded-full">
                      <Image alt="avatar" src={`/api/profile/avatar-todo`} width={20} height={20} className="shrink-0 rounded-3xl w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-center w-[22px] h-[22px] translate-x-[40%] z-10 bg-white rounded-full">
                      <Image alt="avatar" src={`/api/profile/avatar-todo`} width={20} height={20} className="shrink-0 rounded-3xl w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-center w-[22px] h-[22px] bg-white rounded-full">
                      <Image alt="avatar" src={`/api/profile/avatar-todo`} width={20} height={20} className="shrink-0 rounded-3xl w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#1475E1]/20 rounded-full">
                  <div className="w-1/2 bg-[#1475E1] h-full rounded-full"></div>
                </div>
              </div>
            </ClanCard>
            <ClanCard icon="#svg-clan-winrate" title="Win Rate" value="68.5%">
              <div className="flex flex-col gap-2">
                <div className="text-[#22C55E] font-medium">Won: 46</div>
                <div className="w-full h-2 bg-[#EF4444] rounded-full">
                  <div className="w-1/2 bg-[#22C55E] h-full rounded-full"></div>
                </div>
              </div>
            </ClanCard>
          </div>
        </div>
        <div className="flex gap-3">
          <BreadcrumbButton title="Members" svg="#svg-member" href="members" />
          <BreadcrumbButton title="Coffer" svg="#svg-money-dollar" href="coffer" />
          <BreadcrumbButton title="Clan Wars" svg="#svg-clan-war" href="clan-wars" />
          <BreadcrumbButton title="Missions" href="missions" />
        </div>
        {children}
      </div>
    </div>
  )
}
const BreadcrumbButton = ({ title, svg, href }: { title: string, svg?: string, href: string }) => {
  const pathname = usePathname()
  return (
    <Link className={`px-4 py-2 flex items-center gap-2 rounded-xl cursor-pointer ${pathname.includes(`/${href}`) ? "bg-[#1475E1]" : "bg-white/10"} `} href={href}>
      {svg && <svg className="w-6 h-6"><use href={svg} /></svg>}
      <span className="font-medium select-none">{title}</span>
    </Link>
  )
}
const ClanCard = ({ icon, title, value, children }: { icon: string, title: string, value: string, children: ReactNode }) => {
  return (
    <div className="w-full bg-[#0D111B] p-4 flex flex-col gap-4 rounded-2xl">
      <div className="flex gap-4 items-center">
        <div className="p-[10px] rounded-[10px] bg-white/20">
          <svg className="w-7 h-7"><use href={icon} /></svg>
        </div>
        <div className="flex flex-col gap-1">
          <div className="leading-[26px] text-white/70">{title}</div>
          <div className="leading-8 text-2xl font-semibold">{value}</div>
        </div>
      </div>
      {children}
    </div>
  )
}