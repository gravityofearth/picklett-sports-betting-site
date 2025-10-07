import LeaderTable from "./LeaderTable"
import { LeaderType } from "@/types"
export default async function HomePage() {
  const { leaders }: { leaders: LeaderType[] } = await (await fetch('http://localhost:3000/api/leaders', {
    cache: "no-store"
  })).json()
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Winstreak</h1>
          <p className="text-[#99A1AF]">You can see yours and others rewards here</p>
        </div>
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
          <div className="w-full flex gap-4 p-6 border border-[#FE9A0033] bg-linear-to-r from-[#FE9A001A] to-[#FF69001A] rounded-2xl">
            <svg className="w-6 h-6 shrink-0"><use href="#svg-crown" /></svg>
            <div className="flex flex-col gap-2">
              <p className="text-[#FFB900]">Leaderboard & Rewards</p>
              <p className="text-[#FEF3C6CC]">Stay on top of the action with our live leaderboard, showcasing players on winning streaks of 2 or more. Aim higher to unlock instant exclusive bonuses straight to your balance from $50 at 5 wins, to $250 at 10 wins. The more you win, the greater the rewards. (You dont need to bet on every game, just choose the ones you have confidence in!)</p>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2 pt-2 bg-linear-0 from-[#1018284D] to-[#1E293933] border border-[#36415380] rounded-2xl">
            <div className="px-6 flex gap-4 items-center">
              <svg className="w-5 h-5 shrink-0"><use href="#svg-rewards" /></svg>
              <h2 className="text-xl">Reward Table</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-y border-[#36415380] bg-[#1E29394D]">
                    <th className="pl-6 py-2 pr-2 text-left text-sm text-[#D1D5DC]">Winstreak</th>
                    <th className="pl-2 py-2 pr-6 text-left text-sm text-[#D1D5DC]">Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="">
                    <td className="pl-6 py-2 pr-2 whitespace-nowrap flex gap-3 items-center">
                      <div className="flex justify-center items-center rounded-[10px] text-black w-8 h-8 bg-linear-to-r from-[#F54900] to-[#FF6900] text-sm">5</div>
                      <div>5 winstreak</div>
                    </td>
                    <td className="pl-1 py-2 pr-5">
                      <div className="flex gap-2 items-center">
                        <span className="text-[18px] text-[#01A3DB]">$50</span>
                        <div className="text-xs text-[#99A1AF] px-2 py-1 rounded-full bg-[#1E2939]">Bronze</div>
                      </div>
                    </td>
                  </tr>
                  <tr className="">
                    <td className="pl-6 py-2 pr-2 whitespace-nowrap flex gap-3 items-center">
                      <div className="flex justify-center items-center rounded-[10px] text-black w-8 h-8 bg-linear-to-r from-[#99A1AF] to-[#D1D5DC] text-sm">7</div>
                      <div>7 winstreak</div>
                    </td>
                    <td className="pl-1 py-2 pr-5">
                      <div className="flex gap-2 items-center">
                        <span className="text-[18px] text-[#01A3DB]">$100</span>
                        <div className="text-xs text-[#99A1AF] px-2 py-1 rounded-full bg-[#1E2939]">Silver</div>
                      </div>
                    </td>
                  </tr>
                  <tr className="">
                    <td className="pl-6 py-2 pr-2 whitespace-nowrap flex gap-3 items-center">
                      <div className="flex justify-center items-center rounded-[10px] text-black w-8 h-8 bg-linear-to-r from-[#F0B100] to-[#FDC700] text-sm">10</div>
                      <div>10 winstreak</div>
                    </td>
                    <td className="pl-1 py-2 pr-5">
                      <div className="flex gap-2 items-center">
                        <span className="text-[18px] text-[#01A3DB]">$250</span>
                        <div className="text-xs text-[#99A1AF] px-2 py-1 rounded-full bg-[#1E2939]">Gold</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <LeaderTable leaders={leaders} />
      </div>
    </div>
  )
}
