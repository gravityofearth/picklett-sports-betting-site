'use client'

import { WarType } from "@/types"
import { Checkbox, FormControlLabel } from "@mui/material"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { useClan } from "../layout"
import { getWinRate, showToast } from "@/utils"
import { useUser } from "@/store"
import { useParams } from "next/navigation"
import { CircularIndeterminate } from "@/components/MUIs"
import { RuleInfoSection } from "@/components/Cards"
export default function Page() {
  const params = useParams()
  const [showModal, setShowModal] = useState(false)
  const [wars, setWars] = useState<WarType[]>([])
  const [selectedWar, setSelectedWar] = useState<WarType>()
  const fetchWars = () => {
    axios.get(`/api/clan/war?clanId=${params.clanId}`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { wars } }) => {
        setWars(wars)
      })
  }
  useEffect(fetchWars, [])
  return (
    <div className="flex flex-col gap-6 max-md:gap-4">
      <RuleInfoSection />
      <div className="md:text-2xl">Active Wars</div>
      <div className="max-md:hidden w-full p-4 flex justify-between rounded-2xl bg-white/10">
        <div className="w-full text-lg">War Type</div>
        <div className="w-full text-lg">Participants</div>
        <div className="w-full text-lg">Stake</div>
        <div className="w-full text-lg">Prize Pool</div>
        <div className="w-full text-lg">Timing</div>
        <div className="w-full text-lg text-center">Action</div>
      </div>
      {wars.map((war, i) =>
        <ClanWar key={i} war={war}
          callback={(war: WarType) => {
            setSelectedWar(war)
            setShowModal(true)
          }} />
      )}
      {showModal && <ParticipantSelectionModal selectedWar={selectedWar} close={() => setShowModal(false)} fetchWars={fetchWars} />}
    </div>
  )
}
const ClanWar = ({ war, callback }: { war: WarType, callback: (war: WarType) => void }) => {
  const params = useParams()
  const { clan } = useClan()
  const { clan: userClan } = useUser()

  const timing =
    war.startsAt === 0 ? "Unknown" :
      Date.now() < war.startsAt ? `Starts at ${new Date(war.startsAt).toLocaleTimeString()}` :
        Date.now() < war.startsAt + 24 * 60 * 60 * 1000 ? `Ends at ${new Date(war.startsAt + 24 * 60 * 60 * 1000).toLocaleTimeString()}` :
          "Ended"
  const action =
    war.startsAt > Date.now() ? "waiting" :
      war.startsAt === 0 && (war.clans ? war.clans.length : 0) < war.slots ?
        war.clans?.find(v => v.clanId === userClan?.clanId) ?
          "waiting" :
          userClan && userClan.clanId === params.clanId && ["owner", "elder"].includes(userClan.role) ?
            "joinable" :
            "" :
        "view"
  return (
    <div className="w-full p-4 max-md:p-2 flex justify-between max-md:flex-col max-md:gap-2 items-center rounded-2xl bg-[#263244]/60">
      <div className="w-full flex items-center gap-2">
        <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
        <div className="flex flex-col gap-1">
          <span className="text-nowrap">24h Wins War</span>
          <div className="flex gap-2 items-center p-1 rounded-lg bg-[#1475E1]/30">
            <svg className="w-3.5 h-3.5]"><use href="#svg-member" /></svg>
            <span className="text-xs text-nowrap">{war.minMembers} Members</span>
          </div>
        </div>
        <div className="md:hidden w-full text-right">
          {timing}
        </div>
      </div>
      <div className="w-full flex flex-wrap max-md:border max-md:border-white/20 max-md:p-2 max-md:rounded-md md:flex-nowrap md:flex-col gap-2 justify-center max-md:justify-between">
        {war.clans?.map((clan, i) =>
          <div key={i}>
            {/* <Image alt="vs" src={`/vs.png`} width={22} height={22} className="shrink-0 rounded-3xl w-[24px] h-[24px] md:hidden" /> */}
            <div className="flex gap-2 items-center">
              <div className="w-6 h-6 flex justify-center items-center bg-white rounded-full">
                <Image alt="avatar" src={`/api/profile/avatar/${clan.icon}`} width={22} height={22} className="shrink-0 rounded-3xl w-[22px] h-[22px]" />
              </div>
              <span>{clan.title}</span>
            </div>
          </div>
        )}
        {war.slots - (war.clans ? war.clans.length : 0) > 0 &&
          <div className="rounded-lg text-sm py-0.5 px-2 w-fit bg-[#3D4149] border border-white/40 align-middle text-center">
            {war.slots - (war.clans ? war.clans.length : 0)} slot open
          </div>
        }
      </div>
      <div className="w-full max-md:hidden">
        <div className="text-2xl ">${war.stake}</div>
      </div>
      <div className="w-full max-md:hidden">
        <div className="text-2xl ">${war.prize}</div>
      </div>
      <div className="flex w-full justify-between md:hidden">
        <div className=""><span>Stake:</span> ${war.stake}</div>
        <div className=""><span>Prize Pool:</span> ${war.prize}</div>
      </div>
      <div className="w-full max-md:hidden">
        {timing}
      </div>
      <div className="w-full flex justify-center">
        {
          action === "view" &&
          <Link href={`/clans/${clan?._id}/wars/${war._id}/feed`}
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
          <div onClick={() => callback(war)} className="flex gap-2 items-center px-6 py-2 rounded-lg select-none bg-[#1475E1] cursor-pointer hover:bg-[#5494dd]">
            <svg className="w-6 h-6"><use href="#svg-clan-war" /></svg>
            <span className="">Join War</span>
          </div>
        }
      </div>
    </div>
  )
}
const ParticipantSelectionModal = ({ selectedWar, close, fetchWars }: {
  selectedWar: WarType | undefined, close: () => void, fetchWars: () => void
}) => {
  const { clan, members, fetchClan } = useClan()
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState<string>("")
  // const [isTopContributorsSelected, setTopContributorsSelected] = useState(true)
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([])
  const toggleCheckbox = (username: string) => {
    setSelectedUsernames(prev => {
      if (prev.includes(username)) {
        return prev.filter(v => v !== username)
      } else {
        if (prev.length === selectedWar?.minMembers) return prev
        return [...prev, username]
      }
    })
  }
  const handleJoin = () => {
    if (!selectedWar) return
    if (!clan) return
    if (selectedUsernames.length !== selectedWar.minMembers) {
      showToast("Should select required members", "error")
      return
    }
    if (clan.coffer < selectedWar.stake) {
      showToast("Insufficient coffer balance", "error")
      return
    }

    setSending(true)
    axios.post(`/api/clan/war/join`, { warId: selectedWar._id, clanId: clan._id, members: selectedUsernames }, { headers: { token: localStorage.getItem("jwt") } })
      .then(() => {
        showToast("Joined war successfully", "success")
        fetchWars()
        fetchClan()
        close()
      }).catch((e) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      }).finally(() => setSending(false))
  }
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"></div>
      <div className="z-50">
        <div className="bg-[#0E1B2F] w-xl max-md:w-sm rounded-3xl p-6 flex flex-col gap-4">
          <div className="w-full flex justify-between items-center">
            <span>Join war</span>
            <svg onClick={close} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
          </div>
          <div className="bg-[#0D111B] border border-white/20 rounded-lg flex justify-between px-2 py-1">
            <div className="flex flex-col gap-2">
              <span className="text-sm">24h Wins War</span>
              <span className="text-sm text-[#F59E0B]">{
                clan && selectedWar && clan.coffer < selectedWar.stake ?
                  `Insufficient coffer balance` :
                  `$${selectedWar?.stake} will be deducted from coffer($${clan?.coffer})`
              }</span>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className="text-sm">Required Members</span>
              <div className={`text-sm bg-[#F59E0B]/4 p-1 border-[0.5px] rounded-md w-fit ${selectedUsernames.length !== selectedWar?.minMembers ? "text-[#F59E0B] border-[#F59E0B]" : "text-[#0b78f5] border-[#0b78f5]"}`}>{selectedUsernames.length}/{selectedWar?.minMembers}</div>
            </div>
          </div>
          <div className="w-full bg-[#0D111B] px-2 py-3 border border-white/20 flex gap-2 items-center rounded-lg">
            <svg className="w-4 h-4"><use href="#svg-search" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members" className="text-sm leading-4 w-full" />
          </div>
          {/* <div className="w-full flex gap-2">
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
          </div> */}
          <div className="flex flex-col gap-3 bg-[#0D111B] w-full max-h-[50vh] overflow-y-auto rounded-lg border border-white/20 py-3 px-2">
            {
              members.filter(v => selectedUsernames.includes(v.username) || !search || v.username.includes(search.trim()))
                .map((member, i) =>
                  <div key={i} className="w-full flex justify-between">
                    <button onClick={(e) => { toggleCheckbox(member.username); e.preventDefault() }} className="flex gap-3 items-center w-full">
                      {/* <FormGroup> */}
                      <FormControlLabel
                        control={<Checkbox color="success" sx={{ color: "#1475E1", '&.Mui-checked': { color: "#1475E1" } }} />}
                        checked={selectedUsernames.includes(member.username)}
                        label={
                          <div className="flex gap-2 items-center max-md:w-3xs md:w-md justify-between">
                            <div className="flex gap-2 items-center">
                              <Image alt="avatar" src={`/api/profile/avatar/${member.avatar}`} width={24} height={24} className="shrink-0 rounded-full w-6 h-6" />
                              <div className="flex flex-col gap-1">
                                <span className="text-left">{member.username}</span>
                                <div className="text-xs"><span className="text-white/80">Contribution:</span> ${member.clan.contribution}</div>
                              </div>
                            </div>
                            <span className="text-xs text-[#22C55E]">{getWinRate({ bets: member.bets, wins: member.wins })} Win Rate</span>
                          </div>
                        }
                      />
                      {/* </FormGroup> */}
                    </button>
                  </div>
                )}
          </div>
          {sending ? <CircularIndeterminate /> :
            <button onClick={handleJoin} disabled={sending} className="w-full bg-[#1475E1] rounded-lg px-6 py-4 cursor-pointer hover:bg-[#428bdf] disabled:cursor-not-allowed disabled:bg-[#1b2d42]">Join War</button>
          }
        </div>
      </div>
    </div >
  )
}
