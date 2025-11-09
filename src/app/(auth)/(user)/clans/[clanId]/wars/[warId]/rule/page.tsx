import Image from "next/image"
export default function Page() {
  return (
    <div>
      <div className="w-full flex flex-col gap-4 px-6 py-4 max-md:p-2 rounded-2xl max-md:rounded-lg bg-[#1475E1]/10">
        <span className="md:text-2xl ">War Rules & Conditions</span>
        <div className="grid grid-cols-4 max-2xl:grid-cols-2 max-md:grid-cols-1 gap-6">
          <RuleCard title="Objective" description="The clan with the most wins at the end of the war period claims the entire prize pool." img="/dartboard.png" />
          <RuleCard title="Participation" description="Every bet placed by a clan member during the war counts toward the clan's total. There is no minimum number of bets required to participate." img="/sword.png" />
          <RuleCard title="Duration" description="The war runs for 24 hours, followed by an additional 1-hour strategy period once the minimum team requirement has been met." img="/clock.png" />
          <RuleCard title="Winning Criteria" description="Victory in the war is determined by the total number of wins accumulated by each clan during the battle period. The clan with the higher number of wins at the end of the 24-hour war will be declared the winner and claim the entire prize pool." img="/cup.png" />
        </div>
      </div>
    </div>
  )
}
const RuleCard = ({ title, description, img }: { title: string, description: string, img: string }) => {
  return (
    <div className="relative w-full h-[200px] rounded-2xl bg-linear-to-b from-[#1475E1] to-[#1475E1]/40 overflow-hidden" >
      <Image alt="clan-war-rule-banner" width={185} height={185} src={img} className="absolute -right-10 -top-10" />
      <div className="absolute flex flex-col gap-1 items-center bottom-0">
        <span className="text-xl font-medium">{title}</span>
        <span className="text-sm text-center pb-6 px-4 leading-4">{description}</span>
      </div>
    </div>
  )
}
