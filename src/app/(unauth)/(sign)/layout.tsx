"use client"

import Link from "next/link"
import { usePathname } from "next/navigation";
export default function SignLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  return (
    <div className="flex">
      <div className="w-full flex flex-col items-center">
        <div className="flex w-full max-w-xl pt-20 max-md:pt-10">
          <div className="w-full border-b border-white/10"></div>
          <Link href="/register" className={`w-full border-b ${pathname === "/register" ? "border-[#1475E1]" : "border-white/10"} text-center cursor-pointer`}>Register</Link>
          <div className="w-full border-b border-white/10"></div>
          <Link href="/login" className={`w-full border-b ${pathname === "/login" ? "border-[#1475E1]" : "border-white/10"} text-center cursor-pointer`}>Login</Link>
          <div className="w-full border-b border-white/10"></div>
        </div>
        <div className="flex flex-col justify-center w-full max-w-md p-4 h-full">
          <div className="flex flex-col gap-6 items-center">
            {children}
            <p className="text-xs">© 2025 copyrights reserved by Picklett</p>
          </div>
        </div>
      </div>
      <div className="w-full max-md:w-0 relative bg-cover h-screen bg-center bg-[url(/sign_bg.png)]">
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </div>
  )
}
