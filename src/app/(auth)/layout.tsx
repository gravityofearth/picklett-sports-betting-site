"use client"

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/store";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { username, role, balance, setToken } = useUser()
    const pathname = usePathname()
    const logout = () => {
        setToken("LOGOUT")
    }
    useEffect(() => {
        axios.get(`/api/login`, { headers: { token: localStorage.getItem("jwt") } }).then(({ data: { token } }) => { setToken(token) })
    }, [pathname])
    return (
        <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto p-4">
            <div className="flex flex-col justify-between items-center">
                <div className="w-full flex gap-2 justify-between items-end pb-6">
                    <span className="text-2xl">Welcome, {username}</span>
                    <div>Balance: ${balance.toFixed(2)}</div>
                </div>
                <div className="flex flex-wrap justify-end items-center gap-5 w-full">
                    {role !== "user" &&
                        <>
                            <Link href={`/${role}`} className={`${(pathname === `/${role}`) ? "text-purple-600" : ""}`}>Admin</Link>
                            <div className="w-[1px] h-4 bg-gray-500"></div>
                        </>
                    }
                    <Link href={`/user`} className={`${pathname === "/user" ? "text-purple-600" : ""}`}>Home</Link>
                    {/* <div className="w-[1px] h-4 bg-gray-500"></div>
                    <Link href={`/affiliate`} className={`${pathname === "/affiliate" ? "text-purple-600" : ""}`}>Affiliate</Link> */}
                    <div className="w-[1px] h-4 bg-gray-500"></div>
                    <Link href="/leaderboard" className={`${pathname === "/leaderboard" ? "text-purple-600" : ""}`}>Leaderboard</Link>
                    <div className="w-[1px] h-4 bg-gray-500"></div>
                    <Link href={role === "admin" ? "/admin/deposit" : "/deposit"} className={`${(pathname.includes("deposit")) ? "text-purple-600" : ""}`}>Deposit</Link>
                    <div className="w-[1px] h-4 bg-gray-500"></div>
                    <Link href={role === "admin" ? "/admin/withdraw" : "/withdraw"} className={`${(pathname.includes("/withdraw")) ? "text-purple-600" : ""}`}>Withdraw</Link>
                    <div className="w-[1px] h-4 bg-gray-500"></div>
                    <Link href="https://discord.gg/3ra2aXNWV8">
                        <Image alt="discord" width={25} height={10} src={"/discord.png"} />
                    </Link>
                    <div className="w-[1px] h-4 bg-gray-500"></div>
                    <button className="cursor-pointer" onClick={logout}>Logout</button>
                </div>
                <div className="w-full h-2 border-b border-black" />
            </div>
            {children}
        </div>
    );
}
