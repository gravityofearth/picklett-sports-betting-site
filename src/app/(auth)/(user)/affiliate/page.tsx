import { AffiliateRewardType } from "@/types"
import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import AffiliatePage from "./components"
export default async function Page() {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    const { ref, role }: any = jwt.verify(token, JWT_SECRET)
    const { rewards }: { rewards: AffiliateRewardType[] } = await (await fetch('http://localhost:3000/api/affiliate', {
        headers: { token },
        cache: "no-store"
    })).json()

    return (
        <AffiliatePage params={{ rewards, role, ref }} />
    )
}