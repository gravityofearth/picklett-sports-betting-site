import BetTable from "@/components/BetTable"
import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
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
                    <h1 className="font-medium text-2xl">My Bets</h1>
                    <BetTable userBets={userBets} username={username} adminPage={username === "admin"} />
                </div>
            </div>
        )
    } catch (error) {
        redirect("/home")
    }
}