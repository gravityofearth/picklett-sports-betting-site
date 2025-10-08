"use client"

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function UnauthUserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname()
    const [showSidebar, setShowSidebar] = useState(false)
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
                            <Link href="/home" className={`${pathname === "/home" ? "text-[#00BFFF]" : ""}`}>Home</Link>
                            <Link href="/winstreak" className={`${pathname === "/winstreak" ? "text-[#00BFFF]" : ""}`}>Winstreak</Link>
                            <Link href="https://discord.gg/3ra2aXNWV8">
                                <Image alt="discord" width={24} height={18} src={"/discord.png"} />
                            </Link>
                        </div>
                    </div>
                    <Link href="/login" className="font-semibold text-[#D1D5DC]">Sign In</Link>
                </div>
            </div>
            <div className="w-full p-6 max-w-[1440px]">
                {showSidebar &&
                    <div className="fixed flex top-0 left-0 right-0 h-[100vh] font-semibold text-[#D1D5DC]">
                        <div className="flex flex-col px-1 py-6 bg-[#020618] gap-y-2 w-full h-full">
                            <button onClick={() => setShowSidebar(false)} className="flex items-center hover:cursor-pointer px-2">
                                <span className="scale-x-125 p-1 hover:bg-[#333] rounded-md">☰</span>
                            </button>
                            <Link href="/home" className={`p-2 hover:bg-[#333] rounded-md ${pathname === "/home" ? "text-[#00BFFF]" : ""}`}>Home</Link>
                            <Link href="/winstreak" className={`p-2 hover:bg-[#333] rounded-md ${pathname === "/winstreak" ? "text-[#00BFFF]" : ""}`}>Winstreak</Link>
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
