"use client"

import { useEffect } from "react";
import jwt from "jsonwebtoken"
import { useRouter } from "next/navigation";
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter()
    useEffect(() => {
        const username = (jwt.decode(localStorage.getItem("jwt")!) as any)?.username
        if (!username || username !== "admin") {
            router.push("/login")
            return
        }
    }, [])
    return (
        <>
            {children}
        </>
    );
}
