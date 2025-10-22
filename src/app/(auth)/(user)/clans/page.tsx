import Image from "next/image"
import Link from "next/link"

export default function ClansPage() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex gap-3 py-3">
              <svg className="w-6 h-6"><use href="#svg-clan" /></svg>
              <span className="font-medium text-[18px]">Clans</span>
            </div>
            <div className="leading-12">Join forces, challenge rivals, and dominate together</div>
          </div>
          <Link href="/clans/new" className="flex gap-2 py-4 px-6 rounded-lg bg-[#1475E1] cursor-pointer hover:bg-[#5796dd] select-none">
            <svg className="w-6 h-6"><use href="#svg-clan" /></svg>
            <span className="font-medium">Create Clan</span>
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="font-medium text-2xl leading-10">Clan Leaderboard</div>
            <div className="w-full bg-white/10 px-4 py-3 border border-white/20 flex gap-2 items-center rounded-lg">
              <svg className="w-5 h-5"><use href="#svg-search" /></svg>
              <input placeholder="Search clan name" className="text-white/70 w-full" />
            </div>
            <div className="flex gap-3">
              <div className="bg-[#1475E1] px-4 py-2 rounded-xl cursor-pointer">
                All Bets
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl cursor-pointer">
                Top Ranked
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl cursor-pointer">
                Win
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl w-full bg-[#1475E1]/10 flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <Image alt="avatar" src={`/api/profile/avatar-todo`} width={104} height={104} className="shrink-0 rounded-3xl w-[104px] h-[104px]" />
                <div className="flex flex-col gap-4">
                  <div className="text-[32px] font-medium leading-12">Elite Bettors</div>
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-2 items-center">
                      <svg className="w-6 h-6"><use href="#svg-crown-new" /></svg>
                      <span className="font-medium text-white/80">Rank #1</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <svg className="w-6 h-6"><use href="#svg-member" /></svg>
                      <span className="font-medium text-white/80">48/50</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
                      <span className="font-medium text-white/80">2847 wins</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-white/70 font-medium">Top-ranked clan seeking experienced bettors with 60%+ win rate</div>
                <div className="text-[#F59E0B] font-medium">Requirements: 60%+ win rate, 100+ bets placed</div>
              </div>
              <Link href="/clans/clanId/members" className="py-4 px-6 rounded-lg bg-[#1475E1] cursor-pointer hover:bg-[#5796dd] font-medium text-center">View</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}