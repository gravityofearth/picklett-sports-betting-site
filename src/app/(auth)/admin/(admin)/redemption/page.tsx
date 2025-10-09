import { RedemptionType } from "@/types"
import { cookies } from 'next/headers'
import { Redemption } from "./components"
export default async function Page() {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    const { redemptions }: { redemptions: RedemptionType[] } = await (await fetch('http://localhost:3000/api/redemption', {
        headers: { token },
        cache: "no-store"
    })).json()
    return (
        <Redemption params={{ redemptions }} />
    )
}