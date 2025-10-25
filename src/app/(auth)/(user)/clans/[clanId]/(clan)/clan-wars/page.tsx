'use client'

import { Checkbox, FormControlLabel } from "@mui/material"
import Image from "next/image"
import Link from "next/link"
import React, { useState } from "react"
export default function Page() {
  const [showModal, setShowModal] = useState(false)
  return (
    <div className="flex flex-col gap-6 max-md:gap-4">
      <div className="md:text-2xl">Active Wars</div>
      <div className="max-md:hidden w-full p-4 flex justify-between rounded-2xl bg-white/10">
        <div className="w-full text-lg">War Type</div>
        <div className="w-full text-lg">Participants</div>
        <div className="w-full text-lg">Stake</div>
        <div className="w-full text-lg">Prize Pool</div>
        <div className="w-full text-lg">Timing</div>
        <div className="w-full text-lg text-center">Action</div>
      </div>
      <ClanWar warType="24h Wins War" slotCount={2} participants={["Elite Bettors", "Elite Bettors"]} stake={2000} prizePool={4000} timing="Ends: 2025-10-17 10:00" action="view" />
      <ClanWar warType="24h Wins War" slotCount={3} participants={["Elite Bettors", "Elite Bettors"]} stake={2000} prizePool={4000} timing="Ends: 2025-10-17 10:00" action="waiting" />
      <ClanWar warType="24h Wins War" slotCount={2} participants={["Elite Bettors"]} stake={2000} prizePool={4000} timing="Ends: 2025-10-17 10:00" action="joinable" showModal={() => setShowModal(true)} />
      <ClanWar warType="24h Wins War" slotCount={2} participants={[]} stake={2000} prizePool={4000} timing="Ends: 2025-10-17 10:00" action="joinable" showModal={() => setShowModal(true)} />
      {showModal && <ParticipantSelectionModal close={() => setShowModal(false)} />}
    </div>
  )
}
const ClanWar = ({ warType, slotCount, participants, stake, prizePool, timing, action, showModal }: { warType: string, slotCount: number, participants: string[], stake: number, prizePool: number, timing: string, action: "view" | "waiting" | "joinable", showModal?: () => void }) => {
  return (
    <div className="w-full p-4 max-md:p-2 flex justify-between max-md:flex-col max-md:gap-2 items-center rounded-2xl bg-[#263244]/60">
      <div className="w-full flex items-center gap-2">
        <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
        <div className="flex flex-col gap-1">
          <span className="text-nowrap">{warType}</span>
          <div className="flex gap-2 items-center p-1 rounded-lg bg-[#1475E1]/30">
            <svg className="w-[14px] h-[14px]"><use href="#svg-member" /></svg>
            <span className="text-xs text-nowrap">5 Members</span>
          </div>
        </div>
        <div className="md:hidden w-full text-right">
          {timing}
        </div>
      </div>
      <div className="w-full flex flex-wrap max-md:border max-md:border-white/20 max-md:p-2 max-md:rounded-md md:flex-nowrap md:flex-col gap-2 justify-center max-md:justify-between">
        {participants.map((participant, i) =>
          <div key={i}>
            {/* <Image alt="vs" src={`/vs.png`} width={22} height={22} className="shrink-0 rounded-3xl w-[24px] h-[24px] md:hidden" /> */}
            <div className="flex gap-2 items-center">
              <div className="w-6 h-6 flex justify-center items-center bg-white rounded-full">
                <Image alt="avatar" src={`/api/profile/avatar-todo`} width={22} height={22} className="shrink-0 rounded-3xl w-[22px] h-[22px]" />
              </div>
              <span>{participant}</span>
            </div>
          </div>
        )}
        {slotCount - participants.length > 0 &&
          <div className="rounded-lg text-sm py-[2px] px-2 w-fit bg-[#3D4149] border border-white/40 align-middle text-center">
            {slotCount - participants.length} slot open
          </div>
        }
      </div>
      <div className="w-full max-md:hidden">
        <div className="text-2xl ">${stake}</div>
      </div>
      <div className="w-full max-md:hidden">
        <div className="text-2xl ">${prizePool}</div>
      </div>
      <div className="flex w-full justify-between md:hidden">
        <div className=""><span>Stake:</span> ${stake}</div>
        <div className=""><span>Prize Pool:</span> ${prizePool}</div>
      </div>
      <div className="w-full max-md:hidden">
        {timing}
      </div>
      <div className="w-full flex justify-center">
        {
          action === "view" &&
          <Link href="/clans/clanId/wars/clanWarId/feed"
            className="px-6 py-2 rounded-lg select-none bg-[black] cursor-pointer hover:bg-black/50">
            View
          </Link>}
        {
          action === "waiting" &&
          <div className="px-6 py-2 rounded-lg select-none bg-[#FEF3C7]/20 flex gap-2 items-center">
            <span className="text-[#F59E0B] text-center">Waiting to Start</span>
            <svg className="w-6 h-6 animate-[spin_5s_linear_0s_infinite]"><use href="#svg-war-waiting" /></svg>
          </div>}
        {action === "joinable" &&
          <div onClick={showModal} className="flex gap-2 items-center px-6 py-2 rounded-lg select-none bg-[#1475E1] cursor-pointer hover:bg-[#5494dd]">
            <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
            <span className="">Join War</span>
          </div>
        }
      </div>
    </div>
  )
}
const ParticipantSelectionModal = ({ close }: { close: () => void }) => {
  const [isTopContributorsSelected, setTopContributorsSelected] = useState(true)
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"></div>
      <div className="z-50">
        <div className="bg-[#0E1B2F] w-xl max-md:w-sm rounded-3xl p-6 flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <span>Select War Participants</span>
            <svg onClick={close} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
          </div>
          <div className="bg-[#0D111B] border border-white/20 rounded-lg flex justify-between px-2 py-1">
            <div className="flex flex-col gap-2">
              <span className="text-xs">Joining War</span>
              <span className="text-sm">24h Wins War</span>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className="text-sm">Required Members</span>
              <div className="text-sm text-[#F59E0B] bg-[#F59E0B]/4 p-1 border-[0.5px] border-[#F59E0B] rounded-[6px] w-fit">0/3</div>
            </div>
          </div>
          <div className="w-full bg-[#0D111B] px-2 py-3 border border-white/20 flex gap-2 items-center rounded-lg">
            <svg className="w-4 h-4"><use href="#svg-search" /></svg>
            <input placeholder="Search members" className="text-sm leading-4 w-full" />
          </div>
          <div className="w-full flex gap-2">
            <button onClick={() => setTopContributorsSelected(true)}
              className={`w-full flex gap-2 items-center justify-center px-2 cursor-pointer py-3 rounded-lg border ${isTopContributorsSelected === true ? "bg-[#1475E1] border-white/20" : "hover:bg-white/30 bg-white/20 border-white/50"}`}
            >
              <svg className="w-4 h-4 stroke-white"><use href="#svg-crown-new" /></svg>
              <span className="text-sm">Top Contributors</span>
            </button>
            <button onClick={() => setTopContributorsSelected(false)}
              className={`w-full flex gap-2 items-center justify-center px-2 cursor-pointer py-3 rounded-lg border ${isTopContributorsSelected === false ? "bg-[#1475E1] border-white/20" : "hover:bg-white/30 bg-white/20 border-white/50"}`}
            >
              <svg className="w-4 h-4"><use href="#svg-member" /></svg>
              <span className="text-sm">Online Members</span>
            </button>
          </div>
          <div className="flex flex-col gap-3 bg-[#0D111B] w-full rounded-lg border border-white/20 py-3 px-2">
            <div className="w-full flex justify-between">
              <div className="flex gap-3 items-center">
                {/* <FormGroup> */}
                <FormControlLabel
                  control={<Checkbox color="success" sx={{ color: "#1475E1", '&.Mui-checked': { color: "#1475E1" } }} />}
                  label={
                    <div className="flex gap-2 items-center">
                      <Image alt="avatar" src={`/api/profile/avatar-todo`} width={24} height={24} className="shrink-0 rounded-full w-[24px] h-[24px]" />
                      <div className="flex flex-col gap-1">
                        <span className="">Bet King</span>
                        <div className="text-xs"><span className="text-white/80">Contribution:</span> $5,200</div>
                      </div>
                    </div>
                  }
                />
                {/* </FormGroup> */}
              </div>
              <span className="text-xs text-[#22C55E]">68.5% Win Rate</span>
            </div>
          </div>
          <button className="w-full bg-[#1475E1] rounded-lg px-6 py-4 cursor-pointer hover:bg-[#428bdf]">Join War</button>
        </div>
      </div>
    </div>
  )
}
