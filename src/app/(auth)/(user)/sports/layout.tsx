import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { SportsLayout } from "./components/sportsLayout";
import { JWT_SECRET } from '@/utils';
export default async function Page({ children }: Readonly<{ children: React.ReactNode; }>) {
  let oddstype: "decimal" | "american" = "decimal"
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    const { oddstype: _oddstype }: any = jwt.verify(token, JWT_SECRET)
    oddstype = _oddstype
  } catch (error) { }
  return (
    <SportsLayout loggedIn oddstype={oddstype}>
      {children}
    </SportsLayout>
  )
} 