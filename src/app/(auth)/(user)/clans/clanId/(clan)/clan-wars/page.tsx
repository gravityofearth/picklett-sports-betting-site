import Image from "next/image"
import Link from "next/link"
export default function ClansPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-medium">Active Wars</div>
      <div className="w-full p-4 flex justify-between rounded-2xl bg-white/10">
        <div className="w-full text-lg">War Type</div>
        <div className="w-full text-lg">Participants</div>
        <div className="w-full text-lg">Stake</div>
        <div className="w-full text-lg">Prize Pool</div>
        <div className="w-full text-lg">Timing</div>
        <div className="w-full text-lg text-center">Action</div>
      </div>
      <ClanWar warType="24h Wins War" participant1="Elite Bettors" participant2="Elite Bettors" stake={2000} prizePool={4000} timing="Ends: 2025-10-17 10:00" action="view" />
      <ClanWar warType="24h Wins War" participant1="Elite Bettors" participant2="Elite Bettors" stake={2000} prizePool={4000} timing="Ends: 2025-10-17 10:00" action="waiting" />
      <ClanWar warType="24h Wins War" participant1="Elite Bettors" participant2="" stake={2000} prizePool={4000} timing="Ends: 2025-10-17 10:00" action="joinable" />
      <ClanWar warType="24h Wins War" participant1="" participant2="Elite Bettors" stake={2000} prizePool={4000} timing="Ends: 2025-10-17 10:00" action="joinable" />
    </div>
  )
}
const ClanWar = ({ warType, participant1, participant2, stake, prizePool, timing, action }: { warType: string, participant1: string, participant2: string, stake: number, prizePool: number, timing: string, action: "view" | "waiting" | "joinable" }) => {
  return (
    <div className="w-full p-4 flex justify-between items-center rounded-2xl bg-[#263244]/60">
      <div className="w-full flex items-center gap-2">
        <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{warType}</span>
          <div className="flex gap-2 items-center p-1 rounded-lg bg-[#1475E1]/30">
            <svg className="w-[14px] h-[14px]"><use href="#svg-member" /></svg>
            <span className="text-xs font-medium">5 Members</span>
          </div>
        </div>
      </div>
      <div className="w-full">
        {participant1 ?
          <>
            <div className="flex flex-col gap-2 justify-center">
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 flex justify-center items-center bg-white rounded-full">
                  <Image alt="avatar" src={`/api/profile/avatar-todo`} width={22} height={22} className="shrink-0 rounded-3xl w-[22px] h-[22px]" />
                </div>
                <span>{participant1}</span>
              </div>
              {
                participant2 ? <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 flex justify-center items-center bg-white rounded-full">
                    <Image alt="avatar" src={`/api/profile/avatar-todo`} width={22} height={22} className="shrink-0 rounded-3xl w-[22px] h-[22px]" />
                  </div>
                  <span>{participant2}</span>
                </div> :
                  <div className="rounded-lg text-sm py-[2px] px-2 w-fit bg-[#3D4149] border border-white/40 align-middle text-center">
                    1 slot open
                  </div>
              }
            </div>
          </> :
          <div className="rounded-lg text-sm py-[2px] px-2 w-fit bg-[#3D4149] border border-white/40 align-middle text-center">
            2 slot open
          </div>
        }
      </div>
      <div className="w-full">
        <div className="text-2xl font-medium">${stake}</div>
      </div>
      <div className="w-full">
        <div className="text-2xl font-medium">${prizePool}</div>
      </div>
      <div className="w-full">
        {timing}
      </div>
      <div className="w-full flex justify-center">
        <Link href={action === "view" ? "/clans/clanId/wars/clanWarId/feed" : "#"} className={`px-6 py-2 rounded-lg select-none ${action === "view" ? "bg-[black] cursor-pointer hover:bg-black/50" : action === "waiting" ? "bg-[#FEF3C7]/20" : "bg-[#1475E1] cursor-pointer hover:bg-[#5494dd]"}`}>
          {
            action === "view" ? <span>View</span> :
              action === "waiting" ?
                <div className="flex gap-2 items-center">
                  <span className="text-[#F59E0B]">Waiting to Start</span>
                  <svg className="w-6 h-6 animate-[spin_5s_linear_0s_infinite]"><use href="#svg-war-waiting" /></svg>
                </div> :
                <div className="flex gap-2 items-center">
                  <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
                  <span className="">Join War</span>
                </div>
          }
        </Link>
      </div>
    </div>
  )
}
