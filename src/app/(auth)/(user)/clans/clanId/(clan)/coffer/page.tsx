import Image from "next/image"
export default function ClansPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-medium">Clan Coffer</div>
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
            <div className="text-2xl leading-8 font-medium">Total Balance</div>
            <div className="flex gap-2 items-baseline">
              <div className="text-[#FFE720] text-7xl font-bold">125400</div>
              <svg className="w-12 h-12"><use href="#svg-dollar-new" /></svg>
            </div>
            <div className="pt-6 flex gap-2">
              <div className="w-[140px] py-2 px-6 rounded-lg border border-white bg-[#1475E1]/10 flex justify-center items-center gap-2 select-none cursor-pointer hover:bg-[#1475E1]/30">
                <svg className="w-5 h-5"><use href="#svg-clan-deposit-new" /></svg>
                <span className="text-sm ">Deposit</span>
              </div>
              <div className="w-[140px] py-2 px-2 rounded-lg bg-[#1475E1] flex justify-center items-center gap-2 select-none cursor-pointer hover:bg-[#3384e0]">
                <svg className="w-5 h-5"><use href="#svg-clan-distribute-fund" /></svg>
                <span className="text-sm ">Distribute Fund</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute z-10 translate-x-[50%]"><Image alt="clan-balance-right-decoration" width={566} height={495} src="/clan_balance_right.png" /></div>
      </div>
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
        <div className="text-xs font-medium">{content}</div>
      </div>
      <div className="text-xs text-white/80">{description}</div>
    </div>
  )
}
