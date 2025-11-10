import Image from "next/image"
import { ReactNode } from "react"
export const SumCard = ({ icon, amount, heading, description, color }: { icon: string, amount: string, heading: string, description: string, color: string }) => {
  return (
    <div className="w-full flex flex-col gap-4 justify-between p-6 bg-[#0E1B2F] rounded-2xl">
      <div className="flex justify-between items-center">
        <div className="w-12 h-12 flex justify-center items-center rounded-xl" style={{ backgroundColor: `${color}1A` }}>
          <svg className="w-8 h-8"><use href={`#svg-${icon}`} /></svg>
        </div>
        <div className="text-3xl font-semibold" style={{ color: `${color}` }}>{amount}</div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-medium">{heading}</span>
        <span className="text-white/70">{description}</span>
      </div>
    </div>
  )
}
export const RuleCard = ({ title, children, img }: { title: string, children: ReactNode, img: string }) => {
  return (
    <div className="relative w-full h-[200px] rounded-2xl bg-linear-to-b from-[#1475E1] to-[#1475E1]/40 overflow-hidden" >
      <Image alt="clan-war-rule-banner" width={185} height={185} src={img} className="absolute -right-10 -top-10" />
      <div className="absolute flex flex-col gap-1 items-center bottom-0">
        <span className="text-xl font-medium">{title}</span>
        <span className="text-sm text-center pb-6 px-4 leading-4">{children}</span>
      </div>
    </div>
  )
}
export const RuleInfoSection = () => {
  return (
    <div className="grid grid-cols-4 max-2xl:grid-cols-2 max-md:grid-cols-1 gap-6">
      <RuleCard title="Objective" img="/dartboard.png" >
        The clan with the most wins at the end of the war period claims the entire prize pool.
      </RuleCard>
      <RuleCard title="Participation" img="/sword.png">
        Every bet placed by a clan member during the war counts toward the clan's total. There is no minimum number of bets required to participate.
      </RuleCard>
      <RuleCard title="Duration" img="/clock.png" >
        Once the minimum team requirement is met and all positions in the clan war are filled, a 1-hour strategy phase begins before the war officially starts.
        <span className="font-bold"> During this period, any bets placed will not count toward the clan war. </span> The actual war then runs for 24 hours.
      </RuleCard>
      <RuleCard title="Winning Criteria" img="/cup.png">
        Victory in the war is determined by the total number of wins accumulated by each clan during the battle period. The clan with the higher number of wins at the end of the 24-hour war will be declared the winner and claim the entire prize pool.
      </RuleCard>
    </div>
  )
}