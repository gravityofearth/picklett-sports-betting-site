"use client"
import Image from "next/image"
import { useClan } from "../layout"
import { useUser } from "@/store"
import { useParams } from "next/navigation"
import { useState } from "react"
const RoleDict: { [K: string]: { title: string; color: string; } } = {
  "owner": {
    title: "Owner",
    color: "#00B700",
  },
  "elder": {
    title: "Elder",
    color: "#F7931A",
  },
  "member": {
    title: "Member",
    color: "#1475E180",
  },
}
export default function Page() {
  const { members } = useClan()
  const { clan } = useUser()
  const params = useParams()
  const [showKickModal, setShowKickModal] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="md:text-2xl ">Clan Members</div>
        <div className="max-md:text-sm p-4 max-md:p-2 rounded-lg border border-white/10 bg-[#1C2534]">As a clan leader, you can manually add members who contact you on X or Discord. Share your contact info with potential members so they can reach out.</div>
      </div>
      {members.map((member, i) =>
        <div key={i} className="w-full px-8 py-4 max-md:p-2 flex gap-8 max-md:flex-col max-md:gap-2 rounded-2xl max-md:rounded-lg bg-[#263244]/60">
          <div className="flex justify-between items-center w-full gap-8 max-md:gap-2">
            <div className="text-[32px] font-bold max-md:text-sm w-10 shrink-0">#{i + 1}</div>
            <div className="w-full flex items-center gap-4 max-md:gap-3">
              <div className="bg-white w-[50px] h-[50px] max-md:w-[30px] max-md:h-[30px] rounded-full flex justify-center items-center">
                <Image alt="avatar" src={`/api/profile/avatar/${member.avatar}`} width={48} height={48} className="shrink-0 rounded-full w-12 h-12 max-md:w-[28px] max-md:h-[28px]" />
              </div>
              <div className="flex gap-4 items-start max-md:items-center">
                <div className="flex flex-col gap-2">
                  <div className="text-2xl leading-6 max-md:text-[18px] max-md:leading-4">{member.username}</div>
                  <div className="max-md:hidden">{member.wins} Wins</div>
                  <div className="md:hidden text-xs font-semibold rounded-sm h-fit" style={{ color: RoleDict[member.clan.role].color }}>{RoleDict[member.clan.role].title}</div>
                </div>
                <div className="max-md:hidden px-2 py-1 font-semibold rounded-sm h-fit" style={{ backgroundColor: RoleDict[member.clan.role].color }}>{RoleDict[member.clan.role].title}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-3xl leading-10 font-bold max-md:text-[16px] max-md:leading-4">${member.clan.contribution}</div>
              <div className="text-lg leading-6 text-white/80 max-md:hidden">Contribution</div>
              <div className="md:hidden text-sm text-nowrap">{member.wins} Wins</div>
            </div>
          </div>
          <div className="flex md:flex-col w-30 shrink-0 max-md:w-full max-md:justify-between gap-2">
            {member.clan.role !== "owner" && clan?.role === "owner" && clan.clanId === params.clanId && <>
              <button className="h-full py-2 w-full text-sm rounded-lg cursor-pointer hover:bg-[#3b89e2] bg-[#1475E1]">Set to Elder</button>
              <button onClick={() => setShowKickModal(true)} className="h-full py-2 w-full text-sm rounded-lg cursor-pointer hover:bg-[#e6baba] bg-[#FEE2E2] text-[#EF4444]">Kick</button>
            </>}
          </div>
        </div>
      )}
      {showKickModal && <KickModal close={() => setShowKickModal(false)} />}
    </div>
  )
}
const KickModal = ({ close }: { close: () => void }) => {
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div onClick={close} className="fixed inset-0 bg-black/70 z-50"></div>
      <div className="w-xl max-md:w-full p-6 rounded-3xl bg-[#0E1B2F] flex flex-col items-center gap-4 z-50">
        <svg className="w-10 h-10 stroke-[#EF4444]"><use href="#svg-warning-new" /></svg>
        <span className="text-2xl text-[#EF4444]">Are you sure you want to remove?</span>
        <span className="text-white/80 text-center">Are you sure you want to remove "username" from the clan? This action cannot be undone.</span>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-lg cursor-pointer select-none bg-[#EF4444]">Kick Member</button>
          <button onClick={close} className="px-6 py-2 rounded-lg cursor-pointer select-none bg-white/30">Close</button>
        </div>
      </div>
    </div>
  )
}