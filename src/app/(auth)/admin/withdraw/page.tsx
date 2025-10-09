import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import WithdrawTable from "@/components/WithdrawTable"
import { WithdrawType } from "@/types"
import { redirect } from 'next/navigation'

export default async function AdminWithdrawPage() {

  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  try {
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const { withdraw: withdraws }: { withdraw: WithdrawType[] } = await (await fetch('http://localhost:3000/api/withdraw', {
      headers: { token },
      cache: "no-store"
    })).json()
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <WithdrawTable withdraws={withdraws} username={username} adminPage />
      </div>
    )
  } catch (error) {
    redirect("/home")
  }
}
