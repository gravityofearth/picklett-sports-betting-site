import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { redirect } from 'next/navigation';
import AuthUserLayout from './components/authUserLayout';
export default async function Page({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    try {
        jwt.verify(token, JWT_SECRET)
        return (
            <AuthUserLayout>{children}</AuthUserLayout>
        )
    } catch (error) {
        redirect("/login")
    }

}