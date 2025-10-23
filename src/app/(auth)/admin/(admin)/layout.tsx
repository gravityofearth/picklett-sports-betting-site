"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname()
    return (
        <div className="">
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 font-semibold text-[#D1D5DC] py-2">
                <Link href="/admin/line" className={`${pathname === "/admin/line" ? "text-[#00BFFF]" : ""}`}>Line</Link>
                <Link href="/admin/redemption" className={`${pathname === "/admin/redemption" ? "text-[#00BFFF]" : ""}`}>Redemption</Link>
                <Link href="/admin/vault" className={`${pathname === "/admin/vault" ? "text-[#00BFFF]" : ""}`}>Vault</Link>
                <Link href="/admin/clan-war" className={`${pathname === "/admin/clan-war" ? "text-[#00BFFF]" : ""}`}>Clan War</Link>
            </div>
            {children}
        </div>
    )
}
