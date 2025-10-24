"use client"

import Image from "next/image"
import { useState } from "react"
export default function ClansPage() {
  const [leader, setLeader] = useState(true)
  const [modalMode, setModalMode] = useState<"deposit" | "distribute" | "">("")
  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl ">Clan Coffer</div>
      <div className="w-full relative z-30">
        <div className="w-full flex gap-4 justify-between">
          <CofferStep number={1} content="Members Contribute" description="Anyone can deposit funds into the shared coffer" />
          <CofferStep number={2} content="Pool Resources" description="Funds accumulate for clan activities and wars" />
          <CofferStep number={3} content="Fight Clan Wars" description="Use coffer funds to stake in competitive wars" />
          <CofferStep number={4} content="Share Rewards" description="Leaders distribute winnings to members" />
        </div>
      </div>
      <div className="relative flex py-6 justify-center items-center">
        <div className="absolute z-10 translate-x-[-50%]"><Image alt="clan-balance-left-decoration" width={566} height={495} src="/clan_balance_left.png" /></div>
        <div className="bg-[#33383F] rounded-full py-8 px-32 flex flex-col items-center">
          <div className="h-fit flex flex-col items-center z-30">
            <div className="text-2xl leading-8 ">Total Balance</div>
            <div className="flex gap-2 items-baseline">
              <div className="text-[#FFE720] text-7xl font-bold">125400</div>
              <svg className="w-12 h-12"><use href="#svg-dollar-new" /></svg>
            </div>
            <div className="pt-6 flex gap-2">
              <div onClick={() => setModalMode("deposit")} className="w-[140px] py-2 px-6 rounded-lg border border-white bg-[#1475E1]/10 flex justify-center items-center gap-2 select-none cursor-pointer hover:bg-[#1475E1]/30">
                <svg className="w-5 h-5"><use href="#svg-clan-deposit" /></svg>
                <span className="text-sm ">Deposit</span>
              </div>
              {
                leader && <div onClick={() => setModalMode("distribute")} className="w-[140px] py-2 px-2 rounded-lg bg-[#1475E1] flex justify-center items-center gap-1 select-none cursor-pointer hover:bg-[#3384e0]">
                  <svg className="w-5 h-5"><use href="#svg-clan-distribute-fund" /></svg>
                  <span className="text-sm">Distribute Fund</span>
                </div>
              }
            </div>
          </div>
        </div>
        <div className="absolute z-10 translate-x-[50%]"><Image alt="clan-balance-right-decoration" width={566} height={495} src="/clan_balance_right.png" /></div>
      </div>
      <div className="h-2"></div>
      <div className="flex flex-col gap-6">
        <span className="text-2xl  leading-[42px]">Recent Transactions</span>
        <div className="w-full flex justify-between items-center bg-[#263244]/60 rounded-2xl px-8 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-2xl  leading-6">Deposit by BetKing</span>
            <span className="">2 hours ago</span>
          </div>
          <span className="text-[32px] font-bold">$45000</span>
        </div>
      </div>
      {modalMode && <div className="absolute flex justify-center items-center z-50 inset-0">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"></div>
        <div className="z-50"><DepositDistributeModal leader={leader} view={modalMode} setView={setModalMode} /></div>
      </div>}
    </div>
  )
}
const CofferStep = ({ number, content, description }: { number: number, content: string, description: string }) => {
  return (
    <div className="w-full flex flex-col items-center gap-1 py-4 px-4 bg-[#0E1B2F] border border-white/20 rounded-2xl relative">
      {number < 4 &&
        <svg className="absolute right-0 top-[50%] translate-x-[50%] w-[70px] h-[22px] z-20"><use href="#svg-coffer-step-arrow" /></svg>
      }
      <div className="w-11 h-10 rounded-lg bg-[#0D111B] justify-center items-center flex">
        <svg className="w-6 h-6"><use href="#svg-money-dollar" /></svg>
      </div>
      <div className="flex flex-col items-center">
        <div className="font-semibold">Step {number}</div>
        <div className="text-xs ">{content}</div>
      </div>
      <div className="text-xs text-white/80">{description}</div>
    </div>
  )
}
const DepositDistributeModal = ({ leader, view, setView }: { leader?: boolean, view: string, setView: React.Dispatch<React.SetStateAction<"deposit" | "distribute" | "">> }) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-[#0E1B2F] rounded-3xl w-md">
      {
        leader && <div className="w-full flex">
          <div className="w-full border-b border-white/10"></div>
          <div onClick={() => setView("deposit")} className={`w-full border-b text-center  cursor-pointer select-none ${view === "deposit" ? "border-[#1475E1]" : "border-white/10"}`}>Deposit</div>
          <div className="w-full border-b border-white/10"></div>
          <div onClick={() => setView("distribute")} className={`w-full border-b text-center  cursor-pointer select-none ${view === "distribute" ? "border-[#1475E1]" : "border-white/10"}`}>Distribute</div>
          <div className="w-full border-b border-white/10"></div>
        </div>
      }
      {leader ? (view === "deposit" ? <DepositPart setView={setView} /> : <DistributePart setView={setView} />) : <DepositPart setView={setView} />}
    </div>
  )
}
const DepositPart = ({ setView }: { setView: React.Dispatch<React.SetStateAction<"deposit" | "distribute" | "">> }) => {
  const [amount, setAmount] = useState(0)
  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className=" leading-8">Deposit Coffer Funds</span>
        <svg onClick={() => setView("")} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
      </div>
      <div className="p-3 rounded-xl border border-white/20 bg-[#0D111B]/60 flex gap-2">
        <svg className="w-4 h-4"><use href="#svg-i" /></svg>
        <span className="text-xs">Deposits are deducted from your wallet and added to the clan coffer. All transactions are transparent to clan members.</span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="">Coffer Balance</span>
            <div className="flex gap-2 items-center p-2 bg-[#1C2433] rounded-lg border border-white/20">
              <svg className="w-5 h-5"><use href="#svg-dollar-new" /></svg>
              <span className="font-bold text-[#FFE720]">125000</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm ">Amount</span>
            <div className="bg-[#0D111B] flex justify-between items-center rounded-lg border border-white/20 pl-2 p-1">
              <div className="flex gap-2 items-center">
                <svg className="w-4 h-4"><use href="#svg-dollar-stroke" /></svg>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Enter Amount" className="text-sm" />
              </div>
              <button className="text-xs  p-2 bg-white/30 rounded-sm cursor-pointer">Max</button>
            </div>
            <div className="w-full flex justify-between gap-2">
              <button onClick={() => setAmount(100)} className={`rounded-sm w-full p-2 cursor-pointer ${amount === 100 ? "bg-[#1475E1]" : "bg-white/10"}`}>$100</button>
              <button onClick={() => setAmount(250)} className={`rounded-sm w-full p-2 cursor-pointer ${amount === 250 ? "bg-[#1475E1]" : "bg-white/10"}`}>$250</button>
              <button onClick={() => setAmount(500)} className={`rounded-sm w-full p-2 cursor-pointer ${amount === 500 ? "bg-[#1475E1]" : "bg-white/10"}`}>$500</button>
              <button onClick={() => setAmount(1000)} className={`rounded-sm w-full p-2 cursor-pointer ${amount === 1000 ? "bg-[#1475E1]" : "bg-white/10"}`}>$1000</button>
            </div>
          </div>
        </div>
        <button className="p-4 w-full bg-[#1475E1] text-lg rounded-lg ">Deposit from Balance</button>
      </div>
    </>
  )
}
const DistributePart = ({ setView }: { setView: React.Dispatch<React.SetStateAction<"deposit" | "distribute" | "">> }) => {
  const [amount, setAmount] = useState(0)
  const [distributeMode, setDistributeMode] = useState("single")
  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className=" leading-8">Distribute Coffer Funds</span>
        <svg onClick={() => setView("")} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
      </div>
      <div className="p-3 rounded-xl border border-white/20 bg-[#0D111B]/60 flex gap-2">
        <svg className="w-4 h-4"><use href="#svg-i" /></svg>
        <span className="text-xs">As clan leader, you can distribute coffer funds to members. Distributions are added directly to member wallets and recorded in transaction history.</span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="">Coffer Balance</span>
            <div className="flex gap-2 items-center p-2 bg-[#1C2433] rounded-lg border border-white/20">
              <svg className="w-5 h-5"><use href="#svg-dollar-new" /></svg>
              <span className="font-bold text-[#FFE720]">125000</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm ">Distribution Type</span>
            <div className="w-full flex gap-2">
              <button
                onClick={() => setDistributeMode("single")}
                className={`w-full flex gap-2 items-center justify-center px-2 cursor-pointer py-3 rounded-lg border ${distributeMode === "single" ? "bg-[#1475E1] border-white/20" : "hover:bg-white/30 bg-white/20 border-white/50"}`}
              >
                <svg className="w-4 h-4"><use href="#svg-mission" /></svg>
                <span className="text-sm">Single Member</span>
              </button>
              <button
                onClick={() => setDistributeMode("all")}
                className={`w-full flex gap-2 items-center justify-center px-2 cursor-pointer py-3 rounded-lg border ${distributeMode === "all" ? "bg-[#1475E1] border-white/20" : "hover:bg-white/30 bg-white/20 border-white/50"}`}
              >
                <svg className="w-4 h-4"><use href="#svg-member" /></svg>
                <span className="text-sm">All Member</span>
              </button>
            </div>
          </div>
          {distributeMode === "single" &&
            <div className="flex flex-col gap-2">
              <span className="text-sm ">Select Members</span>
              <select name="distribute members" id="" className="bg-[#0D111B] border border-white/20 p-2 rounded-lg">
                <option value="bettor">Bettor</option>
              </select>
              <div className="flex gap-2 flex-wrap">
                <div className="text-sm left-4 p-2 rounded-lg bg-white/10">Bettor</div>
              </div>
            </div>
          }
          <div className="flex flex-col gap-2">
            <span className="text-sm ">Amount</span>
            <div className="bg-[#0D111B] flex justify-between items-center rounded-lg border border-white/20 pl-2 p-1">
              <div className="flex gap-2 items-center">
                <svg className="w-4 h-4"><use href="#svg-dollar-stroke" /></svg>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Enter Amount" className="text-sm" />
              </div>
              <button className="text-xs  p-2 bg-white/30 rounded-sm cursor-pointer">Max</button>
            </div>
            <div className="w-full flex justify-between gap-2">
              <button onClick={() => setAmount(100)} className={`rounded-sm w-full p-2 cursor-pointer ${amount === 100 ? "bg-[#1475E1]" : "bg-white/10"}`}>$100</button>
              <button onClick={() => setAmount(250)} className={`rounded-sm w-full p-2 cursor-pointer ${amount === 250 ? "bg-[#1475E1]" : "bg-white/10"}`}>$250</button>
              <button onClick={() => setAmount(500)} className={`rounded-sm w-full p-2 cursor-pointer ${amount === 500 ? "bg-[#1475E1]" : "bg-white/10"}`}>$500</button>
              <button onClick={() => setAmount(1000)} className={`rounded-sm w-full p-2 cursor-pointer ${amount === 1000 ? "bg-[#1475E1]" : "bg-white/10"}`}>$1000</button>
            </div>
          </div>
        </div>
        <button className="p-4 w-full bg-[#1475E1] text-lg rounded-lg">Distribute</button>
      </div>
    </>
  )
}