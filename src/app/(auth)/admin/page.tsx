import { RedemptionType } from "@/types"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { cookies } from 'next/headers'
import Admin from "./components"
export default async function Page() {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    const { username, role }: any = jwt.verify(token, JWT_SECRET)
    const { redemptions }: { redemptions: RedemptionType[] } = await (await fetch('http://localhost:3000/api/redemption', {
        headers: { token },
        cache: "no-store"
    })).json()
    return (
        <Admin params={{ redemptions, username, role }} />
    )
}