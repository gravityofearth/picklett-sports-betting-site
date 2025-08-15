"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/store";
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { role } = useUser()
    const router = useRouter()
    useEffect(() => {
        if (!role) return
        if (role !== "manager") {
            router.push("/login")
            return
        }
    }, [role])
    return (
        <>
            {children}
        </>
    );
}
