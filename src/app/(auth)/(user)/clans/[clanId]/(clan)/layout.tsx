"use client"

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

export default function Page({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showModal, setShowModal] = useState(false)
  const [isExpand, setIsExpand] = useState(false)
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-8">
        <div className="w-full py-6 px-8 max-md:py-3 max-md:px-4 flex flex-col gap-8 rounded-2xl bg-[#1475E1]/10">
          <div className="flex justify-between">
            <div className="flex gap-4 w-full max-md:flex-col">
              <div className="max-md:flex max-md:justify-between">
                <Image alt="avatar" src={`/api/profile/avatar-todo`} width={104} height={104} className="shrink-0 rounded-3xl max-md:rounded-[10px] w-[104px] h-[104px] max-md:w-10 max-md:h-10" />
                <button className="text-lg md:hidden max-md:text-sm max-md:px-4 max-md:py-2 text-nowrap bg-[#1475E1] px-6 py-4 rounded-lg h-fit cursor-pointer hover:bg-[#428add]">Apply to Join</button>
              </div>
              <div className="w-full flex flex-col gap-2">
                <div className="w-full flex justify-between items-center">
                  <div className="text-[40px] max-md:text-2xl">Elite Bettors</div>
                  <button className="text-lg max-md:hidden text-nowrap bg-[#1475E1] px-6 py-4 rounded-lg h-fit cursor-pointer hover:bg-[#428add]">Apply to Join</button>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex gap-2 items-center">
                    <svg className="w-6 h-6 stroke-[#F7E436]"><use href="#svg-crown-new" /></svg>
                    <span className=" text-white/80">Rank #1</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <svg className="w-6 h-6"><use href="#svg-member" /></svg>
                    <span className=" text-white/80">48/50</span>
                  </div>
                </div>
                <div className="text-sm max-w-3xl">
                  Our clan is more than just a group — it's a family built on teamwork, respect, and determination. We play with passion, compete with strategy, and grow together through every victory and defeat.
                </div>
              </div>
            </div>
          </div>
          <div className={`w-full grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1 ${!isExpand && "max-md:hidden"}`}>
            <ClanCard icon="#svg-clan-level" title="Clan Level" value="8">
              <div className="flex flex-col items-center gap-2">
                <div className="flex justify-between w-full">
                  <div className="text-white/70 ">XP Progress</div>
                  <div className="text-[#1475E1] font-semibold">83%</div>
                </div>
                <div className="w-full h-2 bg-[#1475E1]/20 rounded-full">
                  <div className="w-1/2 bg-[#1475E1] h-full rounded-full"></div>
                </div>
                <div className="flex gap-2 items-center">
                  <span onClick={() => setShowModal(true)} className="text-sm  cursor-pointer hover:underline">See what's on Level 9</span>
                  <svg className="w-4 h-4"><use href="#svg-arrow-right" /></svg>
                </div>
              </div>
            </ClanCard>
            <ClanCard icon="#svg-clan-coffer" title="Coffer Balance" value="$15200">
              <div className="flex gap-2 h-full items-end">
                <div className="flex gap-1 items-center">
                  <svg className="w-6 h-6"><use href="#svg-chart-new" /></svg>
                  <span className="text-sm text-[#22C55E] ">+12.5%</span>
                </div>
                <div className="text-sm text-white/70">vs last week</div>
              </div>
            </ClanCard>
            <ClanCard icon="#svg-member" title="Active Members" value="45/50">
              <div className="flex flex-col gap-2 justify-end h-full">
                <div className="flex justify-between">
                  <div className="text-white/70 ">5 Slots left</div>
                  <IntersectingAvatars urls={[
                    `/api/profile/avatar-todo`,
                    `/api/profile/avatar-todo`,
                    `/api/profile/avatar-todo`,
                    `/api/profile/avatar-todo`,
                    `/api/profile/avatar-todo`,
                  ]} />

                </div>
                <div className="w-full h-2 bg-[#1475E1]/20 rounded-full">
                  <div className="w-1/2 bg-[#1475E1] h-full rounded-full"></div>
                </div>
              </div>
            </ClanCard>
            <ClanCard icon="#svg-clan-winrate" title="Win Rate" value="68.5%">
              <div className="flex flex-col gap-2 justify-end h-full">
                <div className="text-[#22C55E] ">Won: 46</div>
                <div className="w-full h-2 bg-[#EF4444] rounded-full">
                  <div className="w-1/2 bg-[#22C55E] h-full rounded-full"></div>
                </div>
              </div>
            </ClanCard>
          </div>
          <div onClick={() => setIsExpand(v => !v)} className="w-full md:hidden p-2 bg-white/8 rounded-lg flex gap-1 justify-center items-center cursor-pointer select-none">
            <svg className="w-4 h-4"><use href="#svg-leaderboard-icon" /></svg>
            <span className="text-xs">{isExpand ? "Show Less" : "Show Stats"}</span>
            <svg className="w-4 h-4"><use href={`#svg-arrow-${isExpand ? "up" : "down"}`} /></svg>
          </div>
        </div>
        <div className="flex gap-3 w-full overflow-x-auto">
          <BreadcrumbButton title="Members" svg="#svg-member" href="members" />
          <BreadcrumbButton title="Pending Members" svg="#svg-member" href="pending-members" />
          <BreadcrumbButton title="Coffer" svg="#svg-money-dollar" href="coffer" />
          <BreadcrumbButton title="Clan Wars" svg="#svg-clan-war" href="clan-wars" />
          <BreadcrumbButton title="Missions" svg="#svg-mission" href="missions" />
        </div>
        {children}
      </div>
      {showModal && <LevelModal close={() => setShowModal(false)} />}
    </div>
  )
}
const IntersectingAvatars = ({ urls }: { urls: string[] }) => {
  return (
    <div className="flex pr-[10px]">
      {urls.map((url, i) =>
        <div key={i} className="w-[12px]">
          <div className="flex items-center justify-center w-[22px] h-[22px] bg-white rounded-full">
            <Image alt="avatar" src={url} width={20} height={20} className="shrink-0 rounded-3xl w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  )
}
const BreadcrumbButton = ({ title, svg, href }: { title: string, svg?: string, href: string }) => {
  const pathname = usePathname()
  return (
    <Link className={`px-4 py-2 max-md:px-2 max-md:py-1 flex items-center gap-2 max-md:gap-1 rounded-xl max-md:rounded-lg cursor-pointer ${pathname.includes(`/${href}`) ? "bg-[#1475E1]" : "bg-white/10"} `} href={href}>
      {svg && <svg className="w-6 h-6 max-md:w-4 max-md:h-4"><use href={svg} /></svg>}
      <span className="max-md:text-sm text-nowrap select-none">{title}</span>
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
const LevelModal = ({ close }: { close: () => void }) => {
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50"></div>
      <div className="w-xl max-md:w-full p-6 rounded-3xl bg-[#0E1B2F] flex flex-col gap-4 z-50">
        <div className="flex justify-between w-full items-start">
          <div className="flex flex-col gap-2">
            <span className="text-2xl leading-6 ">Level 9 Benefits</span>
            <span>2500 XP needed</span>
          </div>
          <svg onClick={close} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <svg className="w-6 h-6"><use href="#svg-check-new" /></svg>
            <span className="text-sm leading-4">Elite clan status</span>
          </div>
          <div className="flex gap-2 items-center">
            <svg className="w-6 h-6"><use href="#svg-check-new" /></svg>
            <span className="text-sm leading-4">+5% bet winnings to members</span>
          </div>
          <div className="flex gap-2 items-center">
            <svg className="w-6 h-6"><use href="#svg-check-new" /></svg>
            <span className="text-sm leading-4">Premium clan emblem options</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between gap-2 w-full">
            <span className="">Progress to Level 9</span>
            <span className="">83% Complete</span>
          </div>
          <div className="h-2 rounded-full w-full bg-[#1475E1]/20">
            <div className="h-2 rounded-full w-4/5 bg-[#1475E1]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}