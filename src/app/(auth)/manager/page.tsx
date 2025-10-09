import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { cookies } from 'next/headers'
import LineManagement from "@/app/(auth)/admin/(admin)/line/LineManagement"
import { redirect } from "next/navigation"
export default async function Page() {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    try {
        const { username, role }: any = jwt.verify(token, JWT_SECRET)
        return (
            <LineManagement params={{ username, role }} />
        )
    } catch (error) {
        redirect("/home")
    }
}