import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { cookies } from 'next/headers'
import AdminPage from "../admin/components/AdminPage"
export default async function Page() {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    const { username, role }: any = jwt.verify(token, JWT_SECRET)
    return (
        <AdminPage params={{ username, role }} />
    )
}