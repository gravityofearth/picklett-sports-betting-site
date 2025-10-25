"use client"

import Image from "next/image"
import { useState } from "react"
type DepositDistributeModalType = "deposit" | "distribute" | undefined
export default function Page() {
  const isLeader = true
  const [modalMode, setModalMode] = useState<DepositDistributeModalType>(undefined)
  return (
    <div className="flex flex-col gap-4">
      <div className="md:text-2xl">Clan Coffer</div>
      <div className="w-full relative z-30">
        <div className="w-full grid grid-cols-4 max-md:hidden gap-4 justify-between">
          <CofferStep number={1} content="Members Contribute" description="Anyone can deposit funds into the shared coffer" />
          <CofferStep number={2} content="Pool Resources" description="Funds accumulate for clan activities and wars" />
          <CofferStep number={3} content="Fight Clan Wars" description="Use coffer funds to stake in competitive wars" />
          <CofferStep number={4} content="Share Rewards" description="Leaders distribute winnings to members" />
        </div>
      </div>
      <div className="relative flex py-6 justify-center items-center max-xl:scale-80 max-xl:my-[-40px] max-lg:scale-60 max-sm:scale-70 max-sm:my-[-80px]">
        <div className="absolute z-10 translate-x-[-50%] max-sm:hidden"><Image alt="clan-balance-left-decoration" width={566} height={495} src="/clan_balance_left.png" className="shrink-0 w-[565px] h-[495px]" /></div>
        <div className="bg-[#33383F] rounded-full py-8 px-32 max-md:px-24 flex flex-col items-center">
          <div className="h-fit flex flex-col items-center z-30">
            <div className="md:text-2xl leading-8">Total Balance</div>
            <div className="flex gap-2 items-baseline">
              <div className="text-[#FFE720] text-7xl font-bold">125400</div>
              <svg className="w-12 h-12"><use href="#svg-dollar-new" /></svg>
            </div>
            <div className="pt-6 flex gap-2 max-lg:hidden">
              <div onClick={() => setModalMode("deposit")} className="w-[140px] py-2 px-6 rounded-lg border border-white bg-[#1475E1]/10 flex justify-center items-center gap-2 select-none cursor-pointer hover:bg-[#1475E1]/30">
                <svg className="w-5 h-5"><use href="#svg-clan-deposit" /></svg>
                <span className="text-sm ">Deposit</span>
              </div>
              {
                isLeader && <div onClick={() => setModalMode("distribute")} className="w-[140px] py-2 px-2 rounded-lg bg-[#1475E1] flex justify-center items-center gap-1 select-none cursor-pointer hover:bg-[#3384e0]">
                  <svg className="w-5 h-5"><use href="#svg-clan-distribute-fund" /></svg>
                  <span className="text-sm">Distribute Fund</span>
                </div>
              }
            </div>
          </div>
        </div>
        <div className="absolute z-10 translate-x-[50%] max-sm:hidden"><Image alt="clan-balance-right-decoration" width={566} height={495} src="/clan_balance_right.png" className="shrink-0 w-[565px] h-[495px]" /></div>
      </div>
      <div className="pt-6 px-4 flex gap-2 w-full lg:hidden z-50">
        <div onClick={() => setModalMode("deposit")} className="w-full py-2 px-2 rounded-lg border border-white bg-[#1475E1]/10 flex justify-center items-center gap-2 select-none cursor-pointer hover:bg-[#1475E1]/30">
          <svg className="w-5 h-5"><use href="#svg-clan-deposit" /></svg>
          <span className="text-sm ">Deposit</span>
        </div>
        {
          isLeader && <div onClick={() => setModalMode("distribute")} className="w-full py-2 px-2 rounded-lg bg-[#1475E1] flex justify-center items-center gap-1 select-none cursor-pointer hover:bg-[#3384e0]">
            <svg className="w-5 h-5"><use href="#svg-clan-distribute-fund" /></svg>
            <span className="text-sm">Distribute Fund</span>
          </div>
        }
      </div>
      <div className="w-full relative z-30 grid grid-cols-2 md:hidden gap-4 justify-between">
        <CofferStep number={1} content="Members Contribute" description="Anyone can deposit funds into the shared coffer" />
        <CofferStep number={2} content="Pool Resources" description="Funds accumulate for clan activities and wars" />
        <CofferStep number={3} content="Fight Clan Wars" description="Use coffer funds to stake in competitive wars" />
        <CofferStep number={4} content="Share Rewards" description="Leaders distribute winnings to members" />
      </div>
      <div className="h-2"></div>
      <div className="flex flex-col gap-6 max-md:gap-3">
        <span className="md:text-2xl leading-[42px]">Recent Transactions</span>
        <div className="w-full flex justify-between items-center bg-[#263244]/60 rounded-2xl max-md:rounded-lg px-8 py-4 max-md:px-4 max-md:py-2">
          <div className="flex flex-col gap-2">
            <span className="md:text-2xl leading-6">Deposit by BetKing</span>
            <span className="max-md:text-xs">2 hours ago</span>
          </div>
          <span className="text-[32px] max-md:text-[18px] font-bold">$45000</span>
        </div>
      </div>
      {modalMode && <DepositDistributeModal isLeader={isLeader} modalMode={modalMode} setModalMode={setModalMode} />}
    </div>
  )
}
const CofferStep = ({ number, content, description }: { number: number, content: string, description: string }) => {
  return (
    <div className="w-full flex flex-col items-center gap-1 py-4 px-4 bg-[#0E1B2F] border border-white/20 rounded-2xl relative">
      {number < 4 &&
        <svg className="absolute right-0 top-[50%] translate-x-[50%] w-[70px] h-[22px] z-20 max-md:hidden"><use href="#svg-coffer-step-arrow" /></svg>
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
const DepositDistributeModal = ({ isLeader, modalMode, setModalMode }: { isLeader?: boolean, modalMode: DepositDistributeModalType, setModalMode: React.Dispatch<React.SetStateAction<DepositDistributeModalType>> }) => {
  return (
    <div className="fixed flex justify-center-safe items-center-safe z-50 inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"></div>
      <div className="flex flex-col gap-6 p-6 bg-[#0E1B2F] rounded-3xl w-md max-md:w-sm z-50">
        {isLeader &&
          <div className="w-full flex justify-center gap-10 border-b border-white/10">
            <div onClick={() => setModalMode("deposit")} className={`border-b text-center  cursor-pointer select-none ${modalMode === "deposit" ? "border-[#1475E1]" : "border-white/10"}`}>Deposit</div>
            <div onClick={() => setModalMode("distribute")} className={`border-b text-center  cursor-pointer select-none ${modalMode === "distribute" ? "border-[#1475E1]" : "border-white/10"}`}>Distribute</div>
          </div>
        }
        {isLeader && modalMode === "distribute" ?
          <DistributePart setView={setModalMode} /> :
          <DepositPart setView={setModalMode} />
        }
      </div>
    </div>
  )
}
const AmountButton = ({ displayAmount, amount, setAmount }: { displayAmount: number, amount: number, setAmount: React.Dispatch<React.SetStateAction<number>> }) => {
  return (
    <button className={`rounded-sm w-full p-2 cursor-pointer ${displayAmount === amount ? "bg-[#1475E1]" : "bg-white/10"}`}
      onClick={() => setAmount(displayAmount)}>
      ${displayAmount}
    </button>
  )
}
const DepositPart = ({ setView }: { setView: React.Dispatch<React.SetStateAction<DepositDistributeModalType>> }) => {
  const [amount, setAmount] = useState(0)
  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className=" leading-8">Deposit Coffer Funds</span>
        <svg onClick={() => setView(undefined)} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
      </div>
      <div className="p-3 rounded-xl border border-white/20 bg-[#0D111B]/60 flex gap-2">
        <svg className="w-4 h-4 shrink-0"><use href="#svg-i" /></svg>
        <span className="text-xs">Deposits are deducted from your wallet and added to the clan coffer. All transactions are transparent to clan members.</span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="">My Balance</span>
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
              {[100, 250, 500, 1000].map((displayAmount, i) => <AmountButton key={i} displayAmount={displayAmount} amount={amount} setAmount={setAmount} />)}
            </div>
          </div>
        </div>
        <button className="p-4 max-md:p-2 w-full bg-[#1475E1] text-lg max-md:text-sm rounded-lg ">Deposit from Balance</button>
      </div>
    </>
  )
}
const DistributePart = ({ setView }: { setView: React.Dispatch<React.SetStateAction<DepositDistributeModalType>> }) => {
  const [amount, setAmount] = useState(0)
  const [distributeMode, setDistributeMode] = useState<"single" | "all">("single")
  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className=" leading-8">Distribute Coffer Funds</span>
        <svg onClick={() => setView(undefined)} className="w-6 h-6 cursor-pointer"><use href="#svg-close-new" /></svg>
      </div>
      <div className="p-3 rounded-xl border border-white/20 bg-[#0D111B]/60 flex gap-2">
        <svg className="w-4 h-4 shrink-0"><use href="#svg-i" /></svg>
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
              {[100, 250, 500, 1000].map((displayAmount, i) => <AmountButton key={i} displayAmount={displayAmount} amount={amount} setAmount={setAmount} />)}
            </div>
          </div>
        </div>
        <button className="p-4 max-md:p-2 w-full bg-[#1475E1] text-lg max-md:text-sm rounded-lg">Distribute</button>
      </div>
    </>
  )
}