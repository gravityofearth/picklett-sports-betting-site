import Image from "next/image"
export default function ClansPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-medium">Clan Members</div>
        <div className="leading-11 px-4 rounded-lg border border-white/10 bg-[#1C2534]">As a clan leader, you can manually add members who contact you on X or Discord. Share your contact info with potential members so they can reach out.</div>
      </div>
      <div className="w-full px-8 py-4 flex justify-between items-center gap-8 rounded-2xl bg-[#263244]/60">
        <div className="text-[32px] font-bold">#1</div>
        <div className="w-full flex items-center gap-4">
          <div className="bg-white w-[50px] h-[50px] rounded-full flex justify-center items-center">
            <Image alt="avatar" src={`/api/profile/avatar-todo`} width={48} height={48} className="shrink-0 rounded-3xl w-12 h-12" />
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex flex-col gap-2">
              <div className="text-2xl leading-6 font-medium">BetKing</div>
              <div className="">342 Wins</div>
            </div>
            <div className="px-2 py-1 font-semibold bg-[#00B700] rounded-sm h-fit">Leader</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-3xl leading-10 font-bold">$45000</div>
          <div className="text-lg leading-6 text-white/80">Contribution</div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="h-full py-2 px-3 w-30 text-sm font-medium rounded-lg cursor-pointer hover:bg-[#3b89e2] bg-[#1475E1]">Set to Elder</button>
          <button className="h-full py-2 px-3 w-30 text-sm font-medium rounded-lg cursor-pointer hover:bg-[#e6baba] bg-[#FEE2E2] text-[#EF4444]">Kick</button>
        </div>
      </div>
    </div>
  )
}

