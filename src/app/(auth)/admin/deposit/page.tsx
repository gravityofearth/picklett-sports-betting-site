import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { DepositType } from "@/types"
import DepositTable from "@/components/DepositTable"
import { redirect } from 'next/navigation'

export default async function AdminDepositsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  try {
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const { deposit: deposits }: { deposit: DepositType[] } = await (await fetch('http://localhost:3000/api/deposit', {
      headers: { token },
      cache: "no-store"
    })).json()
    return (
      <div className="w-full mx-auto p-4">
        <DepositTable userDeposits={deposits} username={username} adminPage />
      </div>
    )
  } catch (error) {
    redirect("/home")
  }
}
