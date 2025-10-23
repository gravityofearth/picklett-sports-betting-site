export default function ClansPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-2xl ">Clan Missions</div>
        <div className="leading-11 px-4 rounded-lg border border-white/10 bg-[#1C2534]">Complete objectives to earn clan rewards</div>
      </div>
      <div className="w-full px-8 py-6 flex flex-col gap-4 rounded-2xl bg-[#1475E1]/10">
        <div className="flex justify-between items-start">
          <div className="w-full flex flex-col">
            <span className="text-3xl font-semibold leading-12">Reach 50 Members</span>
            <span className=" leading-[32px]">Reward: 5000 Clan XP</span>
          </div>
          <div className="w-fit rounded-sm leading-6 bg-[#FEF3C7] px-2 text-[#F59E0B] text-sm font-semibold text-nowrap">In Progress</div>
        </div>
        <div className="h-[1px] bg-white/30"></div>
        <div className="w-full flex flex-col gap-2">
          <span className="text-lg leading-6">Progress</span>
          <div className="w-full rounded-full bg-[#1475E1]/20 h-[10px]">
            <div className="w-4/5 rounded-full bg-[#1475E1] h-[10px]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

