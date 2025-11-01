"use client"

import Link from "next/link";
import Image from "next/image";
import { useSportsFilter, useUser } from "@/store";
import { ReactNode, useEffect, useState } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { SportsType } from "@/types";

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
    const [expandSidebar, setExpandSidebar] = useState<boolean>()
    useEffect(() => {
        setExpandSidebar(!/Mobi/i.test(navigator.userAgent))
    }, [])
    const [showBalanceDropdown, setShowBalanceDropdown] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    if (expandSidebar === undefined) return <>Loading...</>
    return (
        <div className="flex">
            <div className={expandSidebar ? "max-md:fixed max-md:inset-0 max-md:flex max-md:z-40" : undefined}>
                {expandSidebar && <div onClick={() => setExpandSidebar(false)} className="md:hidden max-md:w-full backdrop-blur-[2px]"></div>}
                <div className={`${expandSidebar ? "w-52 max-md:w-48" : "w-20 max-md:w-14 items-center"} flex flex-col justify-between gap-4 fixed z-40 overflow-y-auto bg-[#121b2f] h-[100vh] px-2 max-md:px-1 transition-[width] ease-in-out`}>
                    <div className={`flex flex-col ${!expandSidebar && "items-center"} gap-4`}>
                        <div className="w-full flex items-center justify-between px-2 py-4 pb-1">
                            <div onClick={() => { setExpandSidebar(prev => !prev) }} className="p-2 max-md:p-1 rounded-full hover:bg-white/10">
                                <svg className="w-8 h-8 max-md:w-6 max-md:h-6 cursor-pointer"><use href="#svg-hamburger" /></svg>
                            </div>
                        </div>
                        <div className="flex flex-col px-2">
                            <SidebarItem href="/user" svg="#svg-nav-home" title="Home" expandSidebar={expandSidebar} />
                            {role !== "user" && <SidebarItem href={`/${role}`} svg="#svg-nav-admin" title="Admin" expandSidebar={expandSidebar} />}
                            {/* <SidebarItem href="/clans" svg="#svg-nav-clan" title="Clan" expandSidebar={expandSidebar} /> */}
                            <SidebarItem href="/bet-history" svg="#svg-nav-my-bets" title="My Bets" expandSidebar={expandSidebar} />
                            <SidebarItem href="/rewards" svg="#svg-nav-vip-club" title="Vip Club" expandSidebar={expandSidebar} />
                            <SidebarItem href="/affiliate" svg="#svg-nav-affiliate" title="Affiliate" expandSidebar={expandSidebar} />
                        </div>
                        <div className="border-b border-white/30 w-full"></div>
                        <div className="flex flex-col px-2">
                            <SidebarItem href="/leaderboard" svg="#svg-nav-winstreak" title="Winstreak" expandSidebar={expandSidebar} highlight />
                        </div>
                        <div className="border-b border-white/30 w-full"></div>
                        <div className="flex flex-col px-2">
                            <SidebarItem to="/user" filter="" svg="#svg-nav-all-sports" title="All Sports" expandSidebar={expandSidebar} />
                            <SidebarItem to="/user" filter="Basketball" svg="#svg-nav-basketball" title="Basketball" expandSidebar={expandSidebar} />
                            <SidebarItem to="/user" filter="Soccer" svg="#svg-nav-soccer" title="Soccer" expandSidebar={expandSidebar} />
                            <SidebarItem to="/user" filter="Tennis" svg="#svg-nav-tennis" title="Tennis" expandSidebar={expandSidebar} />
                            <SidebarItem to="/user" filter="Baseball" svg="#svg-nav-baseball" title="Baseball" expandSidebar={expandSidebar} />
                            <SidebarItem to="/user" filter="Esports" svg="#svg-nav-esports" title="E-Sports" expandSidebar={expandSidebar} />
                            <SidebarItem to="/user" filter="Others" svg="#svg-nav-others" title="Others" expandSidebar={expandSidebar} />
                        </div>
                    </div>
                    <div className="w-full pb-4 flex justify-center">
                        <div className={`flex justify-center items-center p-[1px] bg-linear-to-b from-white/40 to-[#1D2731]/40 ${expandSidebar ? "rounded-2xl max-md:rounded-lg" : "rounded-lg"}`}>
                            <div className={`w-fit flex flex-col gap-4 items-center bg-linear-to-b from-[#182e54] to-[#111b30] ${expandSidebar ? "p-4 rounded-2xl max-md:p-2 max-md:rounded-lg" : "p-2 cursor-pointer rounded-lg"}`}>
                                {expandSidebar ?
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2 items-center max-md:gap-1">
                                            <Image alt="discord" width={20} height={16} src={"/discord.png"} className="max-md:w-4 max-md:h-4" />
                                            <span className="max-md:text-xs text-sm">Discord Community</span>
                                        </div>
                                        <Link href="https://discord.gg/3ra2aXNWV8" className="bg-[#1F8FE4] border border-[#1880CF] rounded-lg text-sm py-2 px-5 max-md:px-2 max-md:py-1 cursor-pointer hover:bg-[#398fd1] text-center">Join</Link>
                                    </div>
                                    :
                                    <Link href="https://discord.gg/3ra2aXNWV8">
                                        <Image alt="discord" width={24} height={16} src={"/discord.png"} className="max-md:w-4 max-md:h-4" />
                                    </Link>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${expandSidebar ? "pl-52" : "pl-20"} max-md:pl-14 w-full flex flex-col items-center relative transition-[padding] ease-in-out`}>
                <div className={`fixed left-0 ${expandSidebar ? "pl-80" : "pl-28"} max-md:pl-18 w-full flex justify-between items-center pr-8 py-6 max-md:px-4 max-md:py-3 bg-linear-to-b from-[#0e111b] via-80% via-[#0e111b] to-transparent`}>
                    <Link className="gap-2 flex items-center cursor-pointer max-md:gap-1" href="/">
                        <div className="w-fit shrink-0 rounded-full flex justify-center bg-white">
                            <Image src="/favicon.ico" width={24} height={24} alt="logo" className="shrink-0" />
                        </div>
                        <div className="max-md:hidden text-2xl font-bold">Picklett</div>
                    </Link>
                    <div className="flex gap-4 justify-between items-center max-md:gap-1">
                        {showBalanceDropdown && <div onClick={() => setShowBalanceDropdown(false)} className="fixed left-0 right-0 top-0 bottom-0 z-10"></div>}
                        <div className="relative" >
                            <div onClick={() => { setShowBalanceDropdown(prev => !prev); setShowUserDropdown(false) }} className="relative rounded-lg flex gap-2 items-center bg-[#0F212E] p-2 cursor-pointer select-none z-20">
                                <svg className="w-6 h-6 fill-white"><use href="#svg-nav-wallet" /></svg>
                                <div className="font-semibold text-sm"><span className="max-md:hidden">Balance: </span>${balance.toFixed(2)}</div>
                            </div>
                            {showBalanceDropdown &&
                                <div className="absolute md:left-0 max-md:right-0 -bottom-2 translate-y-[100%] flex flex-col p-2 rounded-lg bg-[#0F212E] z-20">
                                    <div onClick={() => { setShowBalanceDropdown(false) }}>
                                        <Link href={role === "admin" ? "/admin/deposit" : "/deposit"} className="flex items-center text-sm font-semibold px-1 py-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                            <svg className="w-6 h-6 max-md:hidden"><use href="#svg-nav-deposit" /></svg>
                                            <span>Deposit</span>
                                        </Link>
                                    </div>
                                    <div onClick={() => { setShowBalanceDropdown(false) }}>
                                        <Link href={role === "admin" ? "/admin/withdraw" : "/withdraw"} className="flex items-center text-sm font-semibold px-1 py-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                            <svg className="w-6 h-6 max-md:hidden"><use href="#svg-nav-withdraw" /></svg>
                                            <span>Withdraw</span>
                                        </Link>
                                    </div>
                                </div>
                            }
                        </div>
                        {/* <div className="w-10 h-10 max-md:w-8 max-md:h-8 flex justify-center items-center relative">
                            <div className="w-3 h-3 max-md:w-2 max-md:h-2 rounded-full bg-[#FB2C36] absolute top-1 right-1" />
                            <svg className="w-8 h-8 max-md:w-6 max-md:h-6 cursor-pointer"><use href="#svg-nav-notification" /></svg>
                        </div>
                        <svg className="w-8 h-8 max-md:w-6 max-md:h-6 cursor-pointer"><use href="#svg-nav-message" /></svg> */}
                        <div className="flex gap-[10px] items-center relative">
                            <div onClick={() => { setShowUserDropdown(prev => !prev); setShowBalanceDropdown(false) }} className="flex flex-col max-md:hidden z-20 select-none cursor-pointer">
                                <p className="">{fullname}</p>
                                <p className="text-sm text-white/80">@{username}</p>
                            </div>
                            {showUserDropdown && <div onClick={() => setShowUserDropdown(false)} className="fixed top-0 bottom-0 left-0 right-0 z-10"></div>}
                            <div className="cursor-pointer select-none">
                                <div onClick={() => { setShowUserDropdown(prev => !prev); setShowBalanceDropdown(false) }}>
                                    {avatar && !isError ?
                                        <div className="relative w-8 h-8 rounded-full flex items-center justify-center bg-[#242C3C] overflow-hidden z-20 bg-cover bg-center" style={{ backgroundImage: `url(/api/profile/avatar/${avatar})` }} >
                                            <Image onError={() => setError(true)} src={`/api/profile/avatar/${avatar}`} className="w-0" width={32} height={32} alt="avatar" />
                                        </div> :
                                        <svg className="w-[11px] h-[14px]"><use href="#svg-user" /></svg>
                                    }
                                </div>
                                {showUserDropdown &&
                                    <div className="absolute right-0 -bottom-2 translate-y-[100%] flex flex-col p-2 rounded-lg bg-[#0F212E] z-20">
                                        <div className="flex flex-col p-2 md:hidden">
                                            <p className="">{fullname}</p>
                                            <p className="text-sm text-white/80">@{username}</p>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <Link href="/settings" className="flex items-center text-sm font-medium p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-6 h-6 shrink-0"><use href="#svg-nav-acc-settings" /></svg>
                                                <span className="text-nowrap">Account Settings</span>
                                            </Link>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <Link href="/rewards" className="flex items-center text-sm font-medium p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-6 h-6 shrink-0"><use href="#svg-nav-acc-vip-club" /></svg>
                                                <span className="text-nowrap">VIP Club</span>
                                            </Link>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <Link href="/redemption" className="flex items-center text-sm font-medium p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-6 h-6 shrink-0"><use href="#svg-nav-acc-redeem" /></svg>
                                                <span className="text-nowrap">Redemption</span>
                                            </Link>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <Link href="/transactions/deposit" className="flex items-center text-sm font-medium p-2 gap-2 cursor-pointer hover:bg-[#343C4C] rounded-[6px]">
                                                <svg className="w-6 h-6 shrink-0"><use href="#svg-nav-acc-transaction" /></svg>
                                                <span className="text-nowrap">Transactions</span>
                                            </Link>
                                        </div>
                                        <div onClick={() => { setShowUserDropdown(false) }}>
                                            <button onClick={logout} className="w-full flex items-center text-sm font-medium p-2 gap-2 cursor-pointer hover:bg-[#EF4444]/12 rounded-[6px]">
                                                <svg className="w-6 h-6 shrink-0"><use href="#svg-nav-acc-logout" /></svg>
                                                <span className="text-[#EF4444]">Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full p-8 max-md:p-4 max-md:pt-20 pt-29">
                    {children}
                </div>
            </div>
        </div>
    );
}
const LinkOrButton = ({ children, href, onClick, className }: { children: ReactNode, href?: string, onClick?: () => void, className: string }) => {
    if (href) {
        return <Link href={href} className={className}>
            {children}
        </Link>
    }
    if (onClick) {
        return <button onClick={onClick} className={className}>
            {children}
        </button>
    }
}
export const SidebarItem = ({ expandSidebar, href, to, svg, filter, title, highlight }: { expandSidebar: boolean, href?: string, to?: string, svg: string, filter?: SportsType | "", title: string, highlight?: boolean }) => {
    const pathname = usePathname()
    const router = useRouter()
    const { setSportsFilter } = useSportsFilter()
    return (
        <LinkOrButton href={href} onClick={
            filter !== undefined && to ?
                () => { if (pathname !== to) router.push(to); setSportsFilter(filter) }
                : undefined
        } className={`p-2 rounded-md flex gap-3 items-center cursor-pointer ${highlight ? "bg-radial-[at_50%_75%] from-[#1475E1] via-[#3483dd] to-[#2067b8] to-90%" : pathname === href ? "bg-white/20" : "hover:bg-white/10 "}`}>
            <svg className="w-6 max-md:w-4 h-6 max-md:h-4 fill-white/70"><use href={svg} /></svg>
            {expandSidebar && <span className="max-md:text-sm">{title}</span>}
        </LinkOrButton>
    )
}