"use client"

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SidebarItem } from "@/app/(auth)/components/authUserLayout";

export default function UnauthUserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [expandSidebar, setExpandSidebar] = useState<boolean>()
    useEffect(() => {
        setExpandSidebar(!/Mobi/i.test(navigator.userAgent))
    }, [])
    if (expandSidebar === undefined) return <>Loading...</>
    return (
        <div className="flex">
            <div className={expandSidebar ? "max-md:fixed max-md:inset-0 max-md:flex max-md:z-40" : undefined}>
                {expandSidebar && <div onClick={() => setExpandSidebar(false)} className="md:hidden max-md:w-full backdrop-blur-[2px]"></div>}
                <div className={`${expandSidebar ? "w-52 max-md:w-48" : "w-20 max-md:w-14 items-center"} flex flex-col justify-between gap-4 fixed z-40 overflow-y-auto bg-[#121b2f] h-[100vh] px-2 max-md:px-1 transition-[width] ease-in-out`}>
                    <div className={`flex flex-col ${!expandSidebar && "items-center"} gap-4`}>
                        <div className="w-full flex items-center justify-between px-2 py-4">
                            <div onClick={() => { setExpandSidebar(prev => !prev) }} className="p-2 max-md:p-1 rounded-full hover:bg-white/10">
                                <svg className="w-8 h-8 max-md:w-6 max-md:h-6 cursor-pointer"><use href="#svg-hamburger" /></svg>
                            </div>
                        </div>
                        <div className="flex flex-col px-2">
                            <SidebarItem href="/home" svg="#svg-nav-home" title="Home" expandSidebar={expandSidebar} />
                        </div>
                        <div className="border-b border-white/30 w-full"></div>
                        <div className="flex flex-col px-2">
                            <SidebarItem href="/winstreak" svg="#svg-nav-affiliate" title="Winstreak" expandSidebar={expandSidebar} highlight />
                        </div>
                        <div className="border-b border-white/30 w-full"></div>
                        <div className="flex flex-col px-2">
                            <SidebarItem to="/home" filter="" svg="#svg-nav-all-sports" title="All Sports" expandSidebar={expandSidebar} />
                            <SidebarItem to="/home" filter="Basketball" svg="#svg-nav-basketball" title="Basketball" expandSidebar={expandSidebar} />
                            <SidebarItem to="/home" filter="Soccer" svg="#svg-nav-soccer" title="Soccer" expandSidebar={expandSidebar} />
                            <SidebarItem to="/home" filter="Tennis" svg="#svg-nav-tennis" title="Tennis" expandSidebar={expandSidebar} />
                            <SidebarItem to="/home" filter="Baseball" svg="#svg-nav-baseball" title="Baseball" expandSidebar={expandSidebar} />
                            <SidebarItem to="/home" filter="Esports" svg="#svg-nav-esports" title="E-Sports" expandSidebar={expandSidebar} />
                            <SidebarItem to="/home" filter="Others" svg="#svg-nav-others" title="Others" expandSidebar={expandSidebar} />
                        </div>
                    </div>
                    <div className="w-full pb-4 flex justify-center">
                        <div className={`flex justify-center items-center p-[1px] bg-linear-to-b from-white/40 to-[#1D2731]/40 ${expandSidebar ? "rounded-2xl max-md:rounded-lg" : "rounded-lg"}`}>
                            <div className={`w-fit flex flex-col gap-4 items-center bg-linear-to-b from-[#182e54] to-[#111b30] ${expandSidebar ? "p-4 rounded-2xl max-md:p-2 max-md:rounded-lg" : "p-2 cursor-pointer rounded-lg"}`}>
                                {expandSidebar ?
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2 items-center max-md:gap-1">
                                            <Image alt="discord" width={24} height={16} src={"/discord.png"} className="max-md:w-4 max-md:h-4" />
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
                    <Link href="/login" className="font-semibold text-[#D1D5DC]">Sign In</Link>
                </div>
                <div className="w-full p-6 max-md:p-4 max-md:pt-20 pt-29">
                    {children}
                </div>
            </div>
        </div>
    );
}
