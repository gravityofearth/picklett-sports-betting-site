import Image from "next/image"
export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="md:text-2xl ">Clan Members</div>
        <div className="max-md:text-sm p-4 max-md:p-2 rounded-lg border border-white/10 bg-[#1C2534]">As a clan leader, you can manually add members who contact you on X or Discord. Share your contact info with potential members so they can reach out.</div>
      </div>
      <div className="w-full px-8 py-4 max-md:p-2 flex gap-8 max-md:flex-col max-md:gap-2 rounded-2xl max-md:rounded-lg bg-[#263244]/60">
        <div className="flex justify-between items-center w-full gap-8 max-md:gap-2">
          <div className="text-[32px] font-bold max-md:text-sm">#1</div>
          <div className="w-full flex items-center gap-4 max-md:gap-3">
            <div className="bg-white w-[50px] h-[50px] max-md:w-[30px] max-md:h-[30px] rounded-full flex justify-center items-center">
              <Image alt="avatar" src={`/api/profile/avatar-todo`} width={48} height={48} className="shrink-0 rounded-full w-12 h-12 max-md:w-[28px] max-md:h-[28px]" />
            </div>
            <div className="flex gap-4 items-start max-md:items-center">
              <div className="flex flex-col gap-2">
                <div className="text-2xl leading-6 max-md:text-[18px] max-md:leading-4">BetKing</div>
                <div className="max-md:hidden">342 Wins</div>
                <div className="md:hidden text-xs font-semibold text-[#00B700] rounded-sm h-fit">Leader</div>
              </div>
              <div className="max-md:hidden px-2 py-1 font-semibold bg-[#00B700] rounded-sm h-fit">Leader</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-3xl leading-10 font-bold max-md:text-[16px] max-md:leading-4">$45000</div>
            <div className="text-lg leading-6 text-white/80 max-md:hidden">Contribution</div>
            <div className="md:hidden text-sm text-nowrap">342 Wins</div>
          </div>
        </div>
        <div className="flex md:flex-col max-md:w-full max-md:justify-between gap-2">
          <button className="h-full py-2 px-3 w-30 max-md:w-full text-sm rounded-lg cursor-pointer hover:bg-[#3b89e2] bg-[#1475E1]">Set to Elder</button>
          <button className="h-full py-2 px-3 w-30 max-md:w-full text-sm rounded-lg cursor-pointer hover:bg-[#e6baba] bg-[#FEE2E2] text-[#EF4444]">Kick</button>
        </div>
      </div>
    </div>
  )
}

