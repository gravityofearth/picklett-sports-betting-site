// import { redirect } from 'next/navigation';
// export default async function Page() {
//     redirect("/sports/soccer")
// }
"use client"
import { SportsTab } from "@/app/(auth)/(user)/sports/[sportsId]/UserPage"
import HeroSection from "@/app/(auth)/(user)/sports/components/heroSection"
import { CircularIndeterminate } from "@/components/MUIs"
import { useUser } from "@/store"
import { sportsDataAll } from "@/utils/line"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
export default function Page() {
    const { lineCount } = useUser()
    const router = useRouter()
    useEffect(() => router.push("/sports/soccer"), [])
    return (
        <div className={`w-full flex flex-col gap-4 max-md:gap-2`}>
            <HeroSection />
            <div className="w-full overflow-x-auto flex gap-1">
                {sportsDataAll.map(({ label, sports }, i) =>
                    <SportsTab key={i} selected={false} href={`/sports/${sports}`} icon={`nav-${sports}`} category={label} count={lineCount.find(lc => lc.sports === sports)?.count || 0} />
                )}
            </div>
            <p>Loading...</p>
            <div className="w-full flex justify-center"><CircularIndeterminate /></div>
        </div>
    )
}