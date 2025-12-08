import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { WarType, WrappedLineType } from "@/types"
import UserPage from './UserPage'
import { redirect } from 'next/navigation'

export default async function Page({ params }: { params: any }) {
  const { sportsId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  try {
    const { winstreak, oddstype }: any = jwt.verify(token, JWT_SECRET)
    const { lines, basets }: { lines: WrappedLineType[], basets: number } = await (await fetch(`http://localhost:3000/api/line?sports=${sportsId}`, {
      headers: { token },
      cache: "no-store"
    })).json()
    const { wars: activeWars }: { wars: WarType[] } = await (await fetch('http://localhost:3000/api/clan/war/active', {
      headers: { token },
      cache: "no-store"
    })).json()
    return (
      <UserPage params={{
        activeWars, winstreak, oddstype, timeOffset: new Date().getTime() - basets, sportsId,
        lines: lines
          .map((wrappedLine) => ({
            ...wrappedLine,
            data: wrappedLine.data
              .map(line => ({ ...line, odds: JSON.parse(line.odds) }))
            // .filter(line => line.odds?.num)
          }))
        // .filter(wL => wL.data.length > 0),
      }} />
    )
  } catch (error) {
    redirect("/home")
  }
}