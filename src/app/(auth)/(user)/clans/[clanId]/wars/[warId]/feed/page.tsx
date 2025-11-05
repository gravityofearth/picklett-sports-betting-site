import Image from "next/image"

export default function Page() {
  return (
    <WarFeed avatar={`/api/profile/avatar-todo`} name="BetTitan" event="ManCity vs Chelsea" time={4} side="Lose" />
  )
}

const WarFeed = ({ avatar, name, event, time, side }: { avatar: string, name: string, event: string, time: number, side: "Win" | "Lose" }) => {
  return (
    <div className="w-full p-4 max-md:p-2 rounded-2xl max-md:rounded-lg bg-[#1475E1]/10 flex justify-between">
      <div className="flex gap-4 items-center">
        <Image alt="avatar" src={avatar} width={64} height={64} className="shrink-0 rounded-[15px] w-[64px] h-[64px]" />
        <div className="flex flex-col gap-2">
          <span className="md:text-2xl">{name}</span>
          <div className="max-md:text-xs">{event}</div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div className={`text-lg rounded-lg max-md:text-sm py-1 px-2 ${side === "Win" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#EF4444]/20 text-[#EF4444]"}`}>{side}</div>
        <span className="text-xl text-white/70 font-mediums">{time}m ago</span>
      </div>
    </div>
  )
}