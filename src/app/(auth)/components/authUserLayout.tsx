"use client"

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/store";
import { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import axios, { AxiosError } from "axios";

export default function AuthUserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { username, fullname, role, balance, avatar, setToken } = useUser()
    const [isError, setError] = useState(false)
    const pathname = usePathname()
    const logout = () => {
        axios.get(`/api/logout`)
        setToken("LOGOUT")
        redirect('/home')
    }
    useEffect(() => {
        axios.get(`/api/login`, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { token } }) => { setToken(token) })
            .catch((e: AxiosError) => {
                if (e.response?.statusText.includes("jwt")) logout()
            })
    }, [pathname])
    const [showSidebar, setShowSidebar] = useState(false)
    const [showBalanceDropdown, setShowBalanceDropdown] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    return (
        <div className="w-full flex flex-col items-center relative">
            <div className="w-full flex flex-col items-center bg-[#02061880]">
                <div className="w-full flex justify-between items-center max-w-[1440px] px-6 py-3">
                    <div className="flex justify-between items-center gap-10">
                        <div className="gap-3 flex items-center cursor-pointer">
                            <button onClick={() => setShowSidebar(true)} className="flex md:hidden justify-center items-center hover:cursor-pointer">
                                <span className="scale-x-125 p-1 hover:bg-[#333] rounded-md">☰</span>
                            </button>
                            <Link className="gap-3 flex items-center cursor-pointer max-md:gap-1" href="/">
                                <div className="w-fit shrink-0 rounded-full flex justify-center bg-white">
                                    <Image src="/favicon.ico" width={20} height={20} alt="logo" />
                                </div>
                                <div className="text-xl font-bold">Picklett</div>
                            </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 max-md:hidden font-semibold text-[#D1D5DC]">
                            {role !== "user" && <Link href={`/${role}`} className={`${(pathname === `/${role}`) ? "text-[#00BFFF]" : ""}`}>Admin</Link>}
                            <Link href="/user" className={`${pathname === "/user" ? "text-[#00BFFF]" : ""}`}>Home</Link>
                            <Link href="/affiliate" className={`${pathname === "/affiliate" ? "text-[#00BFFF]" : ""}`}>Affiliate</Link>
                            <Link href="/leaderboard" className={`${pathname === "/leaderboard" ? "text-[#00BFFF]" : ""}`}>Winstreak</Link>
                            <Link href="/bet-history" className={`${pathname === "/bet-history" ? "text-[#00BFFF]" : ""}`}>Bet History</Link>
                            <Link href="/clans" className={`${pathname === "/clans" ? "text-[#00BFFF]" : ""}`}>Clans</Link>
                            <Link href="https://discord.gg/3ra2aXNWV8">
                                <Image alt="discord" width={24} height={18} src={"/discord.png"} />
                            </Link>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-between items-center max-md:gap-1">
                        {/* <div className="w-9 h-9 flex justify-center items-center relative">
                            <div className="w-2 h-2 rounded-full bg-[#FB2C36] absolute top-1 right-1" />
                            <svg className="w-5 h-5"><use href="#svg-notification" /></svg>
                        </div> */}
                        {showBalanceDropdown && <div onClick={() => setShowBalanceDropdown(false)} className="absolute left-0 right-0 top-0 bottom-0 z-10"></div>}
                        <div className="relative" >
                            <div onClick={() => { setShowBalanceDropdown(prev => !prev); setShowUserDropdown(false) }} className="relative rounded-[10px] flex gap-2 bg-[#242C3C] px-3 py-2 cursor-pointer select-none z-20">
                                <svg className="w-5 h-5"><use href="#svg-wallet" /></svg>
                                <div className="font-semibold text-sm"><span className="max-md:hidden">Balance: </span>${balance.toFixed(2)}</div>
                            </div>
                            {showBalanceDropdown &&
                                <div className="absolute md:left-0 max-md:right-0 -bottom-2 translate-y-[100%] flex flex-col p-1 rounded-[10px] bg-[#242C3C] z-20">
                                    <div onClick={() => { setShowBalanceDropdown(false) }}>
                                        <Link href={role === "admin" ? "/admin/deposit" : "/deposit"} className="flex items-center text-[13px] font-semibold p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                            <svg className="w-3 h-3 shrink-0"><use href="#svg-deposit" /></svg>
                                            <span>Deposit</span>
                                        </Link>
                                    </div>
                                    <div onClick={() => { setShowBalanceDropdown(false) }}>
                                        <Link href={role === "admin" ? "/admin/withdraw" : "/withdraw"} className="flex items-center text-[13px] font-semibold p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                            <svg className="w-3 h-3 shrink-0"><use href="#svg-withdraw" /></svg>
                                            <span>Withdraw</span>
                                        </Link>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="flex gap-[10px] items-center">
                            <div onClick={() => { setShowUserDropdown(prev => !prev); setShowBalanceDropdown(false) }} className="flex flex-col max-md:hidden z-20 select-none cursor-pointer">
                                <p className="text-ms font-semibold">{fullname}</p>
                                <p className="text-xs font-semibold">@{username}</p>
                            </div>
                            {showUserDropdown && <div onClick={() => setShowUserDropdown(false)} className="absolute top-0 bottom-0 left-0 right-0 z-10"></div>}
                            <div className="relative">
                                {avatar && !isError ?
                                    <div onClick={() => { setShowUserDropdown(prev => !prev); setShowBalanceDropdown(false) }} className="relative w-8 h-8 rounded-full flex items-center justify-center bg-[#242C3C] cursor-pointer select-none overflow-hidden z-20 bg-cover bg-center" style={{ backgroundImage: `url(/api/profile/avatar/${avatar})` }} >
                                        <Image onError={() => setError(true)} src={`/api/profile/avatar/${avatar}`} className="w-0" width={32} height={32} alt="avatar" />
                                    </div> :
                                    <svg className="w-[11px] h-[14px]"><use href="#svg-user" /></svg>
                                }
                                {showUserDropdown &&
                                    <div className="absolute right-0 -bottom-2 translate-y-[100%] flex flex-col p-1 rounded-[10px] bg-[#242C3C] z-20">
                                        <div className="flex flex-col p-2 md:hidden">
                                            <p className="text-ms font-semibold">{fullname}</p>
                                            <p className="text-xs font-semibold">@{username}</p>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <Link href="/settings" className="flex items-center text-[13px] font-semibold p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-3 h-3 shrink-0"><use href="#svg-user-settings" /></svg>
                                                <span className="text-nowrap">Account Settings</span>
                                            </Link>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <Link href="/rewards" className="flex items-center text-[13px] font-semibold p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-3 h-3 shrink-0"><use href="#svg-user-rewards" /></svg>
                                                <span className="text-nowrap">Picklett Rewards</span>
                                            </Link>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <Link href="/redemption" className="flex items-center text-[13px] font-semibold p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-3 h-3 shrink-0"><use href="#svg-user-redemption" /></svg>
                                                <span className="text-nowrap">Redemption</span>
                                            </Link>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <Link href="/transactions/deposit" className="flex items-center text-[13px] font-semibold p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-3 h-3 shrink-0"><use href="#svg-user-transactions" /></svg>
                                                <span className="text-nowrap">Transactions</span>
                                            </Link>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <button onClick={logout} className="w-full flex items-center text-[13px] font-semibold p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-3 h-3 shrink-0"><use href="#svg-user-logout" /></svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full p-6 max-w-[1440px]">
                {showSidebar &&
                    <div className="fixed flex top-0 left-0 right-0 h-[100vh] font-semibold text-[#D1D5DC]">
                        <div className="flex flex-col px-1 py-6 bg-[#020618] gap-y-2 w-full h-full">
                            <button onClick={() => setShowSidebar(false)} className="flex items-center hover:cursor-pointer px-2">
                                <span className="scale-x-125 p-1 hover:bg-[#333] rounded-md">☰</span>
                            </button>
                            {role !== "user" &&
                                <Link href={`/${role}`} className={`p-2 hover:bg-[#333] rounded-md ${(pathname === `/${role}`) ? "text-[#00BFFF]" : ""}`}>Admin</Link>
                            }
                            <Link href="/user" className={`p-2 hover:bg-[#333] rounded-md ${pathname === "/user" ? "text-[#00BFFF]" : ""}`}>Home</Link>
                            <Link href="/affiliate" className={`p-2 hover:bg-[#333] rounded-md ${pathname === "/affiliate" ? "text-[#00BFFF]" : ""}`}>Affiliate</Link>
                            <Link href="/leaderboard" className={`p-2 hover:bg-[#333] rounded-md ${pathname === "/leaderboard" ? "text-[#00BFFF]" : ""}`}>Winstreak</Link>
                            <Link href="/bet-history" className={`p-2 hover:bg-[#333] rounded-md ${pathname === "/bet-history" ? "text-[#00BFFF]" : ""}`}>Bet History</Link>
                            <Link href="/clans" className={`p-2 hover:bg-[#333] rounded-md ${pathname === "/clans" ? "text-[#00BFFF]" : ""}`}>Clans</Link>
                            <Link href="https://discord.gg/3ra2aXNWV8" className="p-2 hover:bg-[#333] rounded-md">Discord Community</Link>
                        </div>
                        <div className="w-full bg-black/50 h-full" onClick={() => { setShowSidebar(false) }}></div>
                    </div>
                }
                {children}
            </div>
        </div>
    );
}
