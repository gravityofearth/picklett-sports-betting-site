import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { LineType } from "@/types"
import UserPage from './components/UserPage'
export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  const { balance, winstreak, oddstype }: any = jwt.verify(token, JWT_SECRET)
  const { lines, basets }: { lines: LineType[], basets: number } = await (await fetch('http://localhost:3000/api/line', {
    headers: { token },
    cache: "no-store"
  })).json()
  return (
    <UserPage
      params={{
        balance, winstreak, oddstype, basets,
        lines: lines.map(v => ({
          ...v,
          amount: "",
          oddsFormat: "decimal",
          side: null,
        }))
      }} />
  )
}