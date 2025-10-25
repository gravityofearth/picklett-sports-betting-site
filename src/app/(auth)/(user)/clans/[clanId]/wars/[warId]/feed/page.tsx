import Image from "next/image"

export default function Page() {
  return (
    <WarFeed avatar={`/api/profile/avatar-todo`} name="BetTitan" event="ManCity vs Chelsea" count={4} side="Win" />
  )
}

const WarFeed = ({ avatar, name, event, count, side }: { avatar: string, name: string, event: string, count: number, side: "Win" | "Lose" }) => {
  return (
    <div className="w-full p-4 max-md:p-2 rounded-2xl max-md:rounded-lg bg-[#1475E1]/10 flex justify-between">
      <div className="flex gap-4 items-center">
        <Image alt="avatar" src={avatar} width={64} height={64} className="shrink-0 rounded-[15px] w-[64px] h-[64px]" />
        <div className="flex flex-col gap-2">
          <span className="md:text-2xl">{name}</span>
          <div className="max-md:text-xs">{event}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <span className="text-[32px] font-semibold leading-10 max-md:text-lg max-md:leading-6">{side === "Win" ? "+" : "-"}{count}</span>
        <span className="text-2xl text-white/70 max-md:text-sm">{side}</span>
      </div>
    </div>
  )
}