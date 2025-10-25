import Image from "next/image"
import Link from "next/link"

export default function ClansPage() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex gap-3 py-3">
              <svg className="w-6 h-6"><use href="#svg-clan" /></svg>
              <span className="text-[18px]">Clans</span>
            </div>
            <div className="leading-12 max-md:leading-5 max-md:text-sm">Join forces, challenge rivals, and dominate together</div>
          </div>
          <Link href="/clans/new" className="flex gap-2 items-center mt-3 py-4 px-6 max-md:py-2 max-md:px-3 rounded-lg bg-[#1475E1] cursor-pointer hover:bg-[#5796dd] select-none">
            <svg className="w-6 h-6 max-md:w-4 max-md:h-4"><use href="#svg-clan" /></svg>
            <span className="text-nowrap max-md:text-sm">Create Clan</span>
          </Link>
        </div>
        <div className="flex flex-col gap-6 max-md:gap-2">
          <div className="flex flex-col gap-4 max-md:gap-2">
            <div className=" text-2xl leading-10 max-md:leading-5 max-md:text-lg">Clan Leaderboard</div>
            <div className="w-full bg-white/10 px-4 py-3 border border-white/20 flex gap-2 items-center rounded-lg max-md:text-sm max-md:p-2">
              <svg className="w-5 h-5"><use href="#svg-search" /></svg>
              <input placeholder="Search clan name" className="text-white/70 w-full" />
            </div>
            <div className="flex gap-3 max-md:text-sm">
              <div className="bg-[#1475E1] px-4 py-2 rounded-lg cursor-pointer">
                All Bets
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg cursor-pointer">
                Top Ranked
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg cursor-pointer">
                Win
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-6">
            <div className="p-6 max-md:p-4 rounded-2xl w-full bg-[#1475E1]/10 flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="md:hidden flex gap-2 items-center">
                  <svg className="w-6 h-6 stroke-[#F7E436]"><use href="#svg-crown-new" /></svg>
                  <span className=" text-white/80">Rank #1</span>
                </div>
                <Image alt="avatar" src={`/api/profile/avatar-todo`} width={104} height={104} className="shrink-0 rounded-3xl w-[104px] h-[104px] max-md:w-8 max-md:h-8" />
                <div className="flex flex-col gap-4">
                  <div className="text-[32px] leading-12 max-md:text-[18px] max-md:leading-4">Elite Bettors</div>
                  <div className="flex gap-4 items-center max-md:hidden">
                    <div className="flex gap-2 items-center">
                      <svg className="w-6 h-6 stroke-[#F7E436]"><use href="#svg-crown-new" /></svg>
                      <span className=" text-white/80">Rank #1</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <svg className="w-6 h-6"><use href="#svg-member" /></svg>
                      <span className=" text-white/80">48/50</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
                      <span className=" text-white/80">2847 wins</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-white/70 ">Top-ranked clan seeking experienced bettors with 60%+ win rate</div>
                <div className="text-[#F59E0B] max-md:hidden">Requirements: 60%+ win rate, 100+ bets placed</div>
                <div className="flex justify-between md:hidden">
                  <div className="text-sm flex gap-2"><span className="text-white/70">Members </span><span>48</span></div>
                  <div className="text-sm flex gap-2"><span className="text-white/70">Wins </span><span>2847</span></div>
                  <div className="text-sm flex gap-2"><span className="text-white/70">Win rate </span><span>64.2%</span></div>
                </div>
              </div>
              <Link href="/clans/clanId/members" className="py-4 px-6 max-md:p-2 rounded-lg bg-[#1475E1] cursor-pointer hover:bg-[#5796dd]  text-center">View</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}