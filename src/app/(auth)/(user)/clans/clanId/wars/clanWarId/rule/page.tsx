export default function Page() {
  return (
    <div>
      <div className="w-full flex flex-col gap-4 px-6 py-4 rounded-2xl bg-[#1475E1]/10">
        <span className="text-2xl font-medium">War Rules & Conditions</span>
        <div className="flex flex-col gap-4">
          <WarRule number={1} title="Objective" description="The clan with the highest total net winnings at the end of the war period wins the entire pot ($4,000)." />
        </div>
      </div>
    </div>
  )
}

const WarRule = ({ number, title, description }: { number: number, title: string, description: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex justify-center items-center w-6 h-6 rounded-full bg-white/20">{number}</div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-white/70">{description}</span>
      </div>
    </div>
  )
}
