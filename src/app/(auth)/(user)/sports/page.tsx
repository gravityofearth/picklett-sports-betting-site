import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { LineType, WarType } from "@/types"
import UserPage from './components/UserPage'
import { redirect } from 'next/navigation'
export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  try {
    const { balance, winstreak, oddstype }: any = jwt.verify(token, JWT_SECRET)
    const { lines, basets }: { lines: LineType[], basets: number } = await (await fetch('http://localhost:3000/api/line', {
      headers: { token },
      cache: "no-store"
    })).json()
    const { wars: activeWars }: { wars: WarType[] } = await (await fetch('http://localhost:3000/api/clan/war/active', {
      headers: { token },
      cache: "no-store"
    })).json()
    return (
      <UserPage loggedIn
        params={{
          activeWars, balance, winstreak, oddstype, timeOffset: new Date().getTime() - basets,
          lines: lines.map(v => ({
            ...v,
            amount: "",
            oddsFormat: "decimal",
            side: null,
          }))
        }} />
    )
  } catch (error) {
    redirect("/home")
  }
}