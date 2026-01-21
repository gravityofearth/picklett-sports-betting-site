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
        <div className="w-full flex flex-col gap-2">
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <img src="https://api.cron-job.org/jobs/6481181/74895d2b308e8173/status-3.svg" />
                <img src="https://api.cron-job.org/jobs/7179928/b2cf11b48f3866c7/status-3.svg" />
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 font-semibold text-[#D1D5DC] py-2">
                <Link href="/admin/redemption" className={`${pathname === "/admin/redemption" ? "text-[#00BFFF]" : ""}`}>Redemption</Link>
                <Link href="/admin/vault" className={`${pathname === "/admin/vault" ? "text-[#00BFFF]" : ""}`}>Vault</Link>
                <Link href="/admin/clan-war" className={`${pathname === "/admin/clan-war" ? "text-[#00BFFF]" : ""}`}>Clan War</Link>
            </div>
            {children}
        </div>
    )
}
