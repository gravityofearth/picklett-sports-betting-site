import axios from "axios"
import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { DepositType } from "@/types"
import DepositTable from "@/components/DepositTable"
import { redirect } from "next/navigation"
import { SumCard } from "@/components/Cards"

export default async function DepositHistoryPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  try {
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const { data: { deposit: deposits } }: { data: { deposit: DepositType[] } } = await axios.get("http://localhost:3000/api/deposit", { headers: { token } })

    return (
      <div className="flex justify-center">
        <div className="w-full flex flex-col gap-6">
          <div className="w-full grid grid-cols-3 max-lg:grid-cols-1 gap-6">
            <SumCard icon="redeem" amount={deposits.filter(v => v.result === "success").length.toString()} heading="Success" description="Completed deposits" color="#00D492" />
            <SumCard icon="pending" amount={deposits.filter(v => v.result === "confirming").length.toString()} heading="Pending" description="Pending deposits" color="#FFBA00" />
            <SumCard icon="failed" amount={deposits.filter(v => v.result === "expired").length.toString()} heading="Expired" description="Expired deposits" color="#FF6467" />
          </div>
          <DepositTable userDeposits={deposits} username={username} />
        </div>
      </div>
    )
  } catch (error) {
    redirect("/home")
  }
}