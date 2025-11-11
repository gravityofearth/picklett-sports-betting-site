"use client"
import { useClan } from "../layout"

export default function Page() {
  const {clan}=useClan()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="md:text-2xl">Clan Missions</div>
        <div className="px-4 py-2 rounded-lg border border-white/10 bg-[#1C2534] max-md:text-sm max-md:px-2 max-md:py-1">Complete objectives to earn clan rewards</div>
      </div>
      {/* <div className="w-full px-8 py-6 max-md:p-4 flex flex-col gap-4 rounded-2xl bg-[#1475E1]/10">
        <div className="flex justify-between items-start">
          <div className="w-full flex flex-col">
            <span className="text-3xl font-semibold leading-12 max-md:text-xl max-md:leading-8">Reach 50 Members</span>
            <span className="leading-[32px] max-md:text-sm max-md:leading-6">Reward: 5000 Clan XP</span>
          </div>
          <div className="w-fit rounded-sm leading-6 bg-[#FEF3C7] px-2 text-[#F59E0B] text-sm font-semibold text-nowrap">In Progress</div>
        </div>
        <div className="h-[1px] bg-white/30"></div>
        <div className="w-full flex flex-col gap-2">
          <span className="text-lg leading-6 max-md:text-sm">Progress</span>
          <div className="w-full rounded-full bg-[#1475E1]/20 h-[10px]">
            <div className="rounded-full bg-[#1475E1] h-[10px]" style={{width:`${clan?.xp}%`}}></div>
          </div>
        </div>
      </div> */}
    </div>
  )
}

