import BetTable from "@/components/BetTable"
import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import SumCard from "@/components/SumCard"
import { BetType } from "@/types"
import { JWT_SECRET } from "@/utils"
import { redirect } from "next/navigation"

export default async function BetHistory() {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    try {
        const { username }: any = jwt.verify(token, JWT_SECRET)
        const { bet: userBets }: { bet: BetType[] } = await (await fetch('http://localhost:3000/api/bet', {
            headers: { token },
            cache: "no-store"
        })).json()
        return (
            <div className="flex justify-center">
                <div className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Bet History</h1>
                        <p className="text-[#99A1AF]">You can see your betting history</p>
                    </div>
                    <div className="w-full grid grid-cols-3 max-lg:grid-cols-1 gap-6">
                        <SumCard amount={userBets.filter(v => v.status === "win").length.toString()} heading="Winning" description="Lifetime winning from betting" color="#00D492" icon="redeem" />
                        <SumCard amount={userBets.filter(v => v.status === "lose").length.toString()} heading="Losing" description="Lifetime losing from betting" color="#FF6467" icon="failed" />
                        <SumCard amount={userBets.filter(v => v.status === "pending").length.toString()} heading="Pending" description="Pending on the betting" color="#FFBA00" icon="pending" />
                    </div>
                    <BetTable userBets={userBets} username={username} adminPage={username === "admin"} />
                </div>
            </div>
        )
    } catch (error) {
        redirect("/home")
    }
}