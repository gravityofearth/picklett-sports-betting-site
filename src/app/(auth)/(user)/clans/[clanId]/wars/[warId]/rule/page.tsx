import { RuleInfoSection } from "@/components/Cards"
export default function Page() {
  return (
    <div>
      <div className="w-full flex flex-col gap-4 px-6 py-4 max-md:p-2 rounded-2xl max-md:rounded-lg bg-[#1475E1]/10">
        <span className="md:text-2xl ">War Rules & Conditions</span>
        <RuleInfoSection />
      </div>
    </div>
  )
}