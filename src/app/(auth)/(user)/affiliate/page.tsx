"use client"
import AffiliateRewardTable from "@/components/AffiliateRewardTable"
import { svgCopy, svgCopyOk } from "@/components/SVG"
import { useUser } from "@/store"
import { AffiliateRewardType } from "@/types"
import axios from "axios"
import { useEffect, useState } from "react"

export default function AffiliatePage() {
    const [copyContent, setCopyContent] = useState(svgCopy)
    const [referralLink, setReferralLink] = useState("")
    const { role } = useUser()
    const [rewards, setRewards] = useState<AffiliateRewardType[]>([])
    const { ref } = useUser()
    useEffect(() => {
        if (!ref) return
        setReferralLink(`https://www.picklett.com/register?ref=${ref}`)
    }, [ref])
    useEffect(() => {
        axios.get("/api/affiliate", { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { rewards } }: { data: { rewards: AffiliateRewardType[] } }) => {
                setRewards(rewards)
            })
    }, [])
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopyContent(svgCopyOk)
            setTimeout(() => setCopyContent(svgCopy), 500);
        } catch (error) {
        }
    }
    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="my-6 p-6 border border-yellow-500 text-sm text-yellow-700 bg-yellow-100">
                <p>Invite your friends to join our platform using the link below.</p>
                <p>As an affiliate, you will earn rewards every 5 days, once your referrals place bets exceeding $100 generating revenue for our site.</p>
            </div>
            <div className="flex items-center justify-center">
                <code onClick={() => copyToClipboard(referralLink)} className="p-2 bg-gray-100 font-mono text-sm break-all border-[1px] border-gray-400 cursor-pointer w-fit">
                    {referralLink}
                </code>
                <button onClick={() => copyToClipboard(referralLink)} className="p-2 ml-2 border border-gray-300 cursor-pointer rounded-md">
                    {copyContent}
                </button>
            </div>
            <AffiliateRewardTable rewards={rewards} adminPage={role === "admin"} />
        </div>
    )
}