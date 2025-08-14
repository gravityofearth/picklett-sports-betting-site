"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/store";
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { username } = useUser()
    const router = useRouter()
    useEffect(() => {
        if (!username) return
        if (username !== "admin") {
            router.push("/login")
            return
        }
    }, [username])
    return (
        <>
            {children}
        </>
    );
}
