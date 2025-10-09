import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { redirect } from "next/navigation";
export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value ?? ""
    try {
        const { role }: any = jwt.verify(token, JWT_SECRET)
        if (role !== "admin") {
            throw new Error("Not Authorized")
        }
        return (
            <>
                {children}
            </>
        );
    } catch (error) {
        redirect("/home")
    }
}
