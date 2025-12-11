import UserPage from "@/app/(auth)/(user)/sports/[sportsId]/UserPage"
import { WrappedLineType } from "@/types"
export default async function Page({ params }: { params: any }) {
  const { sportsId } = await params
  const { lines, basets }: { lines: WrappedLineType[], basets: number } = await (await fetch(`http://localhost:3000/api/line?sports=${sportsId}`, {
    cache: "no-store"
  })).json()
  return (
    <UserPage
      params={{
        activeWars: [], winstreak: 0, oddstype: "decimal", timeOffset: Date.now() - basets,
        sportsId,
        lines: lines
          .map((wrappedLine) => ({
            ...wrappedLine,
            data: wrappedLine.data
              .map(line => ({ ...line, odds: JSON.parse(line.odds) }))
            // .filter(line => line.startsAt > Date.now())
          }))
        // .filter(wL => wL.data.length > 0),
      }} />
  )
}