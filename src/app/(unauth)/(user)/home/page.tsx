import UserPage from "@/app/(auth)/(user)/sports/components/UserPage"
import { LineType } from "@/types"
export default async function Page() {
  const { lines, basets }: { lines: LineType[], basets: number } = await (await fetch('http://localhost:3000/api/line', {
    cache: "no-store"
  })).json()
  return (
    <UserPage
      params={{
        balance: 0, winstreak: 0, oddstype: "decimal", timeOffset: new Date().getTime() - basets,
        lines: lines.map(v => ({
          ...v,
          amount: "",
          oddsFormat: "decimal",
          side: null,
        }))
      }} />
  )
}