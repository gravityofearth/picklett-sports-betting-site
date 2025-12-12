import { LineType } from '@/types'
import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import LineDetailPage from './lineId'
import Link from 'next/link'

export default async function Page({ params }: { params: any }) {
  const { lineId } = await params
  let oddstype: "decimal" | "american" = "decimal"
  let isAdmin = false
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    const { oddstype: _oddstype, role }: any = jwt.verify(token, JWT_SECRET)
    oddstype = _oddstype
    isAdmin = role === "admin"
  } catch (error) { }
  const { line }: { line: LineType } = await (await fetch(`http://localhost:3000/api/line/id/${lineId}`, {
    // headers: { token },
    cache: "no-store"
  })).json()
  if (!line) return <>
    Not found
    <Link href="./" className="flex gap-2 items-center cursor-pointer hover:underline">
      <svg className="w-6 h-6 fill-white"><use href="#svg-left-arrow" /></svg>
      <span className="leading-6 max-md:leading-4 select-none">Back to Home</span>
    </Link>
  </>
  return (
    <LineDetailPage line={line} oddstype={oddstype} isAdmin={isAdmin} />
  )
}