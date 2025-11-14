"use client"

import { CircularIndeterminate } from "@/components/MUIs";
import { useUser } from "@/store";
import { ClanMemberType, ClanType, UserClanType } from "@/types";
import { getWinRate, showToast, xpStep } from "@/utils";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const ClanContext = createContext<{ clan: ClanType | undefined, members: ClanMemberType[], pendingMembers: ClanMemberType[], fetchClan: () => void }>({ clan: undefined, members: [], pendingMembers: [], fetchClan: () => { } })
export const useClan = () => ({
  clan: useContext(ClanContext).clan,
  members: useContext(ClanContext).members,
  pendingMembers: useContext(ClanContext).pendingMembers,
  fetchClan: useContext(ClanContext).fetchClan,
})
export default function Page({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const { clan: userClan, setToken } = useUser()
  const [clan, setClan] = useState<ClanType>()
  const [clanRank, setClanRank] = useState(0)
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showTransferOnwershipModal, setShowTransferOnwershipModal] = useState(false)
  const [usernameToTransfer, setUsernameToTransfer] = useState("")
  const [showTransferOnwershipConfirmModal, setShowTransferOnwershipConfirmModal] = useState(false)
  const [isExpand, setIsExpand] = useState(false)
  const [sending, setSending] = useState(false)
  const members = useMemo(() => clan ? clan.members.filter((m: any) => m.clan.joined).sort((b, a) => {
    if (b.clan.role === "owner") return -1
    if (a.clan.role === "owner") return 1
    return a.wins - b.wins
  }) : [], [clan])
  const pendingMembers = useMemo(() => clan ? clan.members.filter((m: any) => !m.clan.joined).sort((b, a) => a.wins - b.wins) : [], [clan])
  const winRate = useMemo(() => clan ? getWinRate({ bets: clan.bets, wins: clan.wins }) : "", [clan])
  const isMatchingClan = useMemo(() => userClan ? userClan.clanId === clan?._id : false, [clan, userClan])
  const isJoined = useMemo(() => userClan ? userClan.joined : false, [userClan])
  const isOwnerAlone = useMemo(() => members.length === 1, [members])
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const fetchClan = () => {
    if (!pathname) return
    if (!isClient) return
    if (!localStorage.getItem("jwt")) return
    axios.get(`/api/clan/${params.clanId}`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { token, clan, rank } }: { data: { token: string, clan: ClanType, rank: number } }) => {
        setToken(token)
        setClan(clan)
        setClanRank(rank)
      })
  }
  useEffect(fetchClan, [isClient, pathname])
  const handleClan = () => {
    if (!clan) return
    if (!userClan || !userClan.joined) {
      setShowJoinConfirmModal(true)
    }
    if (isMatchingClan && isJoined) {
      setShowLeaveModal(true)
    }
  }
  if (!clan) return null
  return (
    <ClanContext.Provider value={{ clan, members, pendingMembers, fetchClan }}>
      <div className="flex justify-center">
        <div className="w-full flex flex-col gap-8">
          <div className="w-full py-6 px-8 max-md:py-3 max-md:px-4 flex flex-col gap-8 rounded-2xl bg-[#1475E1]/10">
            <div className="flex justify-between">
              <div className="flex gap-4 w-full max-md:flex-col">
                <div className="max-md:flex max-md:justify-between shrink-0">
                  <Image alt="avatar" src={`/api/profile/avatar/${clan.icon}`} width={104} height={104} className="rounded-3xl max-md:rounded-[10px] w-[104px] h-[104px] max-md:w-10 max-md:h-10" />
                  <JoinButton params={{
                    className: `md:hidden max-md:text-sm max-md:px-4 max-md:py-2`,
                    handleClan, isJoined, isMatchingClan, sending
                  }} />
                </div>
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full flex justify-between items-center">
                    <div className="text-[40px] max-md:text-2xl">{clan.title}</div>
                    <div className="flex items-center gap-2">
                      {isMatchingClan === isJoined && userClan?.role === "owner" &&
                        <Link href="./edit" className="bg-[#1475E1] px-6 py-4 max-md:px-4 max-md:py-2 max-md:text-[14px] rounded-lg text-[18px]">Edit Clan</Link>
                      }
                      <JoinButton params={{
                        className: `max-md:hidden`,
                        handleClan, isJoined, isMatchingClan, sending
                      }} />
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-2 items-center">
                      <svg className="w-6 h-6 stroke-[#F7E436]"><use href="#svg-crown-new" /></svg>
                      <span className=" text-white/80">Rank #{clanRank}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <svg className="w-6 h-6"><use href="#svg-member" /></svg>
                      <span className=" text-white/80">{members.length}/50</span>
                    </div>
                  </div>
                  <div className="text-sm max-w-3xl wrap-break-word">
                    {clan.description}
                  </div>
                </div>
              </div>
            </div>
            <div className={`w-full grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1 ${!isExpand && "max-md:hidden"}`}>
              <ClanCard icon="#svg-clan-level" title="Clan Level" value={`${clan.level}`}>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex justify-between w-full">
                    <div className="text-white/70 ">XP Progress</div>
                    <div className="text-[#1475E1] font-semibold">{Math.floor(clan.xp)}/{xpStep(clan.xp)}</div>
                  </div>
                  <div className="w-full h-2 bg-[#1475E1]/20 rounded-full">
                    <div className="bg-[#1475E1] h-full rounded-full" style={{ width: `${clan.xp * 100 / xpStep(clan.xp)}%` }}></div>
                  </div>
                  {/* <div className="flex gap-2 items-center">
                    <span onClick={() => setShowLevelModal(true)} className="text-sm  cursor-pointer hover:underline">See what's on Level 9</span>
                    <svg className="w-4 h-4"><use href="#svg-arrow-right" /></svg>
                  </div> */}
                </div>
              </ClanCard>
              <ClanCard icon="#svg-clan-coffer" title="Coffer Balance" value={`$${clan.coffer.toFixed(2)}`} />
              <ClanCard icon="#svg-member" title="Active Members" value={`${members.length}/50`}>
                <div className="flex flex-col gap-2 justify-end h-full">
                  <div className="flex justify-between">
                    <div className="text-white/70 ">{50 - members.length} Slots left</div>
                    <IntersectingAvatars urls={members.slice(0, 5).map(v => `/api/profile/avatar/${v.avatar}`)} />

                  </div>
                  <div className="w-full h-2 bg-[#1475E1]/20 rounded-full">
                    <div className="bg-[#1475E1] h-full rounded-full" style={{ width: `${members.length * 2}%` }}></div>
                  </div>
                </div>
              </ClanCard>
              <ClanCard icon="#svg-clan-winrate" title="Win Rate" value={winRate}>
                <div className="flex flex-col gap-2 justify-end h-full">
                  <div className="text-[#22C55E] ">{clan.wins} Wins</div>
                  <div className="w-full h-2 bg-[#EF4444] rounded-full">
                    <div className="bg-[#22C55E] h-full rounded-full" style={{ width: winRate }}></div>
                  </div>
                </div>
              </ClanCard>
            </div>
            <div onClick={() => setIsExpand(v => !v)} className="w-full md:hidden p-2 bg-white/8 rounded-lg flex gap-1 justify-center items-center cursor-pointer select-none">
              <svg className="w-4 h-4"><use href="#svg-leaderboard-icon" /></svg>
              <span className="text-xs">{isExpand ? "Show Less" : "Show Stats"}</span>
              <svg className="w-4 h-4"><use href={`#svg-arrow-${isExpand ? "up" : "down"}`} /></svg>
            </div>
          </div>
          <div className="flex gap-3 w-full overflow-x-auto">
            <BreadcrumbButton title="Members" svg="#svg-member" href="members" />
            <BreadcrumbButton title="Pending Members" svg="#svg-member" href="pending-members" />
            <BreadcrumbButton title="Coffer" svg="#svg-money-dollar" href="coffer" />
            <BreadcrumbButton title="Clan Wars" svg="#svg-clan-war" href="clan-wars" />
            <BreadcrumbButton title="Missions" svg="#svg-mission" href="missions" />
          </div>
          {children}
        </div>
        {showLevelModal &&
          <LevelModal close={() => setShowLevelModal(false)} />
        }
        {showJoinConfirmModal &&
          <JoinConfirmModal disabled={sending}
            onConfirm={() => {
              setSending(true)
              axios.post(`/api/clan/join`, { id: clan._id }, { headers: { token: localStorage.getItem("jwt") } })
                .then(() => {
                  showToast("Sent join request to clan owner", "success")
                  setShowJoinConfirmModal(false)
                  fetchClan()
                }).catch((e) => {
                  showToast(e.response?.statusText || "Unknown Error", "error")
                }).finally(() => setSending(false))
            }} close={() => { setShowJoinConfirmModal(false) }} />
        }
        {showLeaveModal &&
          <LeaveModal close={() => setShowLeaveModal(false)} isOwnerAlone={isOwnerAlone} disabled={sending}
            onConfirm={() => {
              if (isOwnerAlone) {
                setSending(true)
                axios.post(`/api/clan/leave`, {}, { headers: { token: localStorage.getItem("jwt") } })
                  .then(() => {
                    showToast("You left from this clan", "success")
                    router.push('/clans')
                  }).catch((e) => {
                    showToast(e.response?.statusText || "Unknown Error", "error")
                  }).finally(() => {
                    setSending(false)
                    setShowLeaveModal(false)
                  })
              } else {
                setShowLeaveModal(false)
                setShowTransferOnwershipModal(true)
              }
            }} />
        }
        {showTransferOnwershipModal &&
          <TransferOwnershipModal close={() => setShowTransferOnwershipModal(false)}
            openConfirmModal={(username: string) => {
              setShowTransferOnwershipConfirmModal(true)
              setUsernameToTransfer(username)
            }} />
        }
        {showTransferOnwershipConfirmModal &&
          <TransferOwnershipConfirmModal disabled={sending} close={() => setShowTransferOnwershipConfirmModal(false)}
            onConfirm={() => {
              if (clan._id !== userClan?.clanId) return
              setSending(true)
              axios.post(`/api/clan/leave`, { usernameToTransfer }, { headers: { token: localStorage.getItem("jwt") } })
                .then(() => {
                  showToast("You left from this clan", "success")
                  fetchClan()
                  setShowTransferOnwershipModal(false)
                }).catch((e) => {
                  showToast(e.response?.statusText || "Unknown Error", "error")
                }).finally(() => {
                  setSending(false)
                  setShowTransferOnwershipConfirmModal(false)
                })
            }} />
        }
      </div>
    </ClanContext.Provider>
  )
}
const JoinButton = ({ params: { className, sending, handleClan, isJoined, isMatchingClan } }: { params: { className: string, sending: boolean, handleClan: () => void, isJoined: boolean, isMatchingClan: boolean } }) => {
  return (
    <button onClick={handleClan} disabled={sending || (isMatchingClan !== isJoined)} className={`${className} text-lg text-nowrap bg-[#1475E1] px-6 py-4 rounded-lg h-fit cursor-pointer hover:bg-[#428add] disabled:cursor-not-allowed disabled:bg-[#28425f]`}>
      {isMatchingClan ? (isJoined ? "Leave Clan" : "Waiting...") : "Apply to Join"}
    </button>
  )
}
const IntersectingAvatars = ({ urls }: { urls: string[] }) => {
  return (
    <div className="flex pr-[10px]">
      {urls.map((url, i) =>
        <div key={i} className="w-[12px]">
          <div className="flex items-center justify-center w-[22px] h-[22px] bg-white rounded-full">
            <Image alt="avatar" src={url} width={20} height={20} className="shrink-0 rounded-3xl w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  )
}
const BreadcrumbButton = ({ title, svg, href }: { title: string, svg?: string, href: string }) => {
  const pathname = usePathname()
  return (
    <Link className={`px-4 py-2 max-md:px-2 max-md:py-1 flex items-center gap-2 max-md:gap-1 rounded-xl max-md:rounded-lg cursor-pointer ${pathname.includes(`/${href}`) ? "bg-[#1475E1]" : "bg-white/10"} `} href={href}>
      {svg && <svg className="w-6 h-6 max-md:w-4 max-md:h-4"><use href={svg} /></svg>}
      <span className="max-md:text-sm text-nowrap select-none">{title}</span>
    </Link>
  )
}
const ClanCard = ({ icon, title, value, children }: { icon: string, title: string, value: string, children?: ReactNode }) => {
  return (
    <div className="w-full bg-[#0D111B] p-4 flex flex-col gap-4 rounded-2xl">
      <div className="flex gap-4 items-center">
        <div className="p-[10px] rounded-[10px] bg-white/20">
          <svg className="w-7 h-7"><use href={icon} /></svg>
        </div>
        <div className="flex flex-col gap-1">
          <div className="leading-[26px] text-white/70">{title}</div>
          <div className="leading-8 text-2xl font-semibold">{value}</div>
        </div>
      </div>
      {children}
    </div>
  )
}
const LevelModal = ({ close }: { close: () => void }) => {
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50"></div>
      <div className="w-xl max-md:w-full p-6 rounded-3xl bg-[#0E1B2F] flex flex-col gap-4 z-50">
        <div className="flex justify-between w-full items-start">
          <div className="flex flex-col gap-2">
            <span className="text-2xl leading-6 ">Level 9 Benefits</span>
            <span>2500 XP needed</span>
          </div>
          <svg onClick={close} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <svg className="w-6 h-6"><use href="#svg-check-new" /></svg>
            <span className="text-sm leading-4">Elite clan status</span>
          </div>
          <div className="flex gap-2 items-center">
            <svg className="w-6 h-6"><use href="#svg-check-new" /></svg>
            <span className="text-sm leading-4">+5% bet winnings to members</span>
          </div>
          <div className="flex gap-2 items-center">
            <svg className="w-6 h-6"><use href="#svg-check-new" /></svg>
            <span className="text-sm leading-4">Premium clan emblem options</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between gap-2 w-full">
            <span className="">Progress to Level 9</span>
            <span className="">83% Complete</span>
          </div>
          <div className="h-2 rounded-full w-full bg-[#1475E1]/20">
            <div className="h-2 rounded-full w-4/5 bg-[#1475E1]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
const LeaveModal = ({ close, onConfirm, isOwnerAlone, disabled }: { close: () => void, onConfirm: () => void, isOwnerAlone: boolean, disabled?: boolean }) => {
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div onClick={close} className="fixed inset-0 bg-black/70 z-50"></div>
      <div className="w-xl max-md:w-full p-6 rounded-3xl bg-[#0E1B2F] flex flex-col items-center gap-4 z-50">
        <svg className="w-10 h-10 stroke-[#F59E0B]"><use href="#svg-warning-new" /></svg>
        <span className="text-2xl text-[#F59E0B]">
          {isOwnerAlone ? "Clan will be deleted" :
            "Transfer Ownership"
          }
        </span>
        <span className="text-white/80 text-center">
          {isOwnerAlone ? "As you are owner of this clan and you are about to leave, it will be deleted after your leaving." :
            "Before you leave the clan, transfer ownership to other members."
          }
        </span>
        <div className="flex gap-4">
          {disabled ? <CircularIndeterminate /> :
            <button onClick={onConfirm} disabled={disabled} className="px-6 py-2 rounded-lg cursor-pointer select-none bg-[#F59E0B] disabled:cursor-not-allowed">
              {isOwnerAlone ? "Yes, delete" : "Transfer Ownership"}
            </button>
          }
          <button onClick={close} className="px-6 py-2 rounded-lg cursor-pointer select-none bg-white/30">Close</button>
        </div>
      </div>
    </div>
  )
}
const JoinConfirmModal = ({ close, onConfirm, disabled }: { close: () => void, onConfirm: () => void, disabled?: boolean }) => {
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div onClick={close} className="fixed inset-0 bg-black/70 z-50"></div>
      <div className="w-xl max-md:w-full p-6 rounded-3xl bg-[#0E1B2F] flex flex-col items-center gap-4 z-50">
        <svg className="w-10 h-10 stroke-[#F59E0B]"><use href="#svg-warning-new" /></svg>
        <span className="text-2xl text-[#F59E0B]">Did you notice?</span>
        <div className="text-sm max-md:text-xs">
          <p>
            <span className="font-bold">Join or build your own clan</span> to unlock shared
            <Link href="/clans/info" target="_blank" className="italic underline"> global perks</Link>,
            boosted odds, and exclusive tournaments.
          </p>
          <p>Each time you win a bet, <span className="font-bold">0.1% of your winnings goes to your clan's coffer</span> — fueling bigger rewards for everyone.</p>
          <p><span className="font-bold">Level up together</span> and enter epic Clan Wars — from 24-hour skirmishes to week-long battles for massive prize pools.</p>
        </div>
        <div className="flex gap-4">
          {disabled ? <CircularIndeterminate /> :
            <button onClick={onConfirm} disabled={disabled} className="px-6 py-2 rounded-lg cursor-pointer select-none bg-[#F59E0B] disabled:cursor-not-allowed">
              Yes, acknowledge
            </button>
          }
          <button onClick={close} className="px-6 py-2 rounded-lg cursor-pointer select-none bg-white/30">No</button>
        </div>
      </div>
    </div>
  )
}
const TransferOwnershipModal = ({ close, openConfirmModal }: { close: () => void, openConfirmModal: (_: string) => void }) => {
  const { members } = useClan()
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 z-50"></div>
      <div className="w-7xl max-md:w-full p-6 rounded-3xl bg-[#0E1B2F] flex flex-col gap-4 z-50">
        <div className="flex justify-between w-full items-start">
          <span className="text-2xl">
            Transfer Ownership
          </span>
          <svg onClick={close} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
        </div>
        <div className="flex flex-col gap-4 w-full">
          {members.filter(m => m.clan.role !== "owner").map((member, i) =>
            <div key={i} className="p-6 rounded-2xl bg-[#263244]/60 hover:bg-[#263244]/40 transition-[background] ease-in-out flex max-md:flex-col justify-between items-center cursor-pointer">
              <div className="flex gap-4 items-center">
                <Image alt="avatar" src={`/api/profile/avatar/${member.avatar}`} width={48} height={48} className="shrink-0 rounded-full w-12 h-12 max-md:w-[28px] max-md:h-[28px]" />
                <div className="flex flex-col gap-2 w-[100px]">
                  <span className="text-xl max-md:text-sm  font-medium">{member.username}</span>
                  <div className="text-xs p-2 rounded-sm w-fit bg-[#F7931A]">{member.clan.role}</div>
                </div>
              </div>
              <div className="flex md:flex-col gap-2 items-center">
                <span className="text-xl max-md:text-sm  text-white/80">Contribution</span>
                <span className="text-2xl max-md:text-xs font-semibold">${member.clan.contribution}</span>
              </div>
              <div className="flex md:flex-col gap-2 items-center">
                <span className="text-xl max-md:text-sm  text-white/80">Win Rate</span>
                <span className="text-2xl max-md:text-xs font-semibold">{getWinRate({ wins: member.wins, bets: member.bets })}</span>
              </div>
              <div className="flex md:flex-col gap-2 items-center">
                <span className="text-xl max-md:text-sm  text-white/80">Total Won</span>
                <span className="text-2xl max-md:text-xs font-semibold">{member.wins}</span>
              </div>
              <button onClick={() => openConfirmModal(member.username)} className="flex gap-2 bg-[#1475E1] hover:bg-[#1455e1] transition-[background] ease-in-out cursor-pointer py-2 px-6 rounded-lg">
                <svg className="w-6 h-6 stroke-white"><use href="#svg-transferonwership" /></svg>
                <span>TransferOwnership</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
const TransferOwnershipConfirmModal = ({ onConfirm, close, disabled }: { onConfirm: () => void, close: () => void, disabled?: boolean }) => {
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div onClick={close} className="fixed inset-0 bg-black/70 z-50"></div>
      <div className="w-xl max-md:w-full p-6 rounded-3xl bg-[#0E1B2F] flex flex-col items-center gap-4 z-50">
        <svg className="w-10 h-10 stroke-[#F7E436]"><use href="#svg-transferonwership" /></svg>
        <span className="text-2xl text-white">Transfer Clan Ownership?</span>
        <span className="text-white/80 text-center">Are you sure you want to transfer clan ownership to "username" You will become a regular member and will no longer have leader privileges. This action cannot be undone.</span>
        {/* <svg onClick={close} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg> */}
        <div className="flex gap-4">
          {disabled ? <CircularIndeterminate /> :
            <button disabled={disabled} onClick={onConfirm} className="px-6 py-2 rounded-lg cursor-pointer select-none bg-[#F59E0B] flex gap-2 disabled:cursor-not-allowed">
              <svg className="w-6 h-6 stroke-white"><use href="#svg-transferonwership" /></svg>
              <span>Transfer Ownership</span>
            </button>
          }
          <button onClick={close} className="px-6 py-2 rounded-lg cursor-pointer select-none bg-white/30">Close</button>
        </div>
      </div>
    </div>
  )
}