import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { cookies } from 'next/headers'
import LineManagement from "./LineManagement"
import { redirect } from "next/navigation"
export default async function Page() {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    try {
        const { username, role }: any = jwt.verify(token, JWT_SECRET)
        return (
            <div className="">
                <div className="w-full flex flex-wrap justify-center items-center gap-2">
                    <img src="https://api.cron-job.org/jobs/6481181/74895d2b308e8173/status-3.svg" />
                    <img src="https://api.cron-job.org/jobs/6614970/ef8881450c16905e/status-3.svg" />
                </div>
                <LineManagement params={{ username, role }} />
            </div>
        )
    } catch (error) {
        redirect("/home")
    }
}