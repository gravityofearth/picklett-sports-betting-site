"use client"

import AffiliateRewardTable from "@/components/AffiliateRewardTable"
import SumCard from "@/components/SumCard"
import { svgCopy, svgCopyOk } from "@/components/SVG"
import { useUser } from "@/store"
import { AffiliateRewardType } from "@/types"
import axios from "axios"
import { useEffect, useState } from "react"

export default function AffiliatePage() {
    const [copyContent, setCopyContent] = useState(svgCopy)
    const [copyStatus, setCopyStatus] = useState("Copy")
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
            setCopyStatus("Copied")
            setTimeout(() => {
                setCopyContent(svgCopy)
                setCopyStatus("Copy")
            }, 500);
        } catch (error) {
        }
    }
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-7xl flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Affilate Program</h1>
                    <p className="text-[#99A1AF]">Earn rewards by inviting friends to join our platform</p>
                </div>
                <div className="flex gap-4 p-6 border border-[#FE9A0033] bg-linear-to-r from-[#FE9A001A] to-[#FF69001A] rounded-2xl">
                    <svg className="w-6 h-6 shrink-0"><use href="#svg-affiliate" /></svg>
                    <div className="flex flex-col gap-2">
                        <p className="text-[#FFB900]">How It Works</p>
                        <p className="text-[#FEF3C6CC]">Invite your friends to join our platform using the link below.</p>
                        <p className="text-[#FEF3C6CC]">As an affiliate, you will earn rewards every 5 days, once your referrals place bets exceeding $100 generating revenue for our site.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-6 bg-linear-0 from-[#1018284D] to-[#1E293933] border border-[#36415380] rounded-2xl">
                    <div className="flex gap-3">
                        <svg className="w-6 h-6"><use href="#svg-link" /></svg>
                        <h1 className="text-xl">Your Affiliate Link</h1>
                    </div>
                    <p className="text-[#99A1AF]">Share this link with your friends to start earning commissions</p>
                    <div className="flex">
                        <code onClick={() => copyToClipboard(referralLink)} className="p-2 bg-[#1E293980] rounded-xl font-mono text-sm break-all border border-[#364153] cursor-pointer w-fit">
                            {referralLink}
                        </code>
                        <button onClick={() => copyToClipboard(referralLink)} className="p-2 ml-2 cursor-pointer flex gap-2 items-center">
                            {copyContent} {copyStatus}
                        </button>
                    </div>
                </div>
                <div className="w-full grid grid-cols-3 max-md:grid-cols-1 gap-6">
                    <SumCard icon="dollar" amount={`$${rewards.reduce((prev, current) => (prev + current.earning), 0)}`} heading="Total Earnings" description="Lifetime affiliate earnings" color="#00D492" />
                    <SumCard icon="referee" amount={[...new Set(rewards.map(reward => reward.detail.map(v => v.referee)).reduce((prev, current) => ([...prev, ...current]), []))].length.toString()} heading=" Total Referrals" description="Active referred users" color="#01A3DB" />
                    <SumCard icon="commission-rate" amount="5%" heading="Avg Commission" description="Average commission rate" color="#C27AFF" />
                </div>
                <AffiliateRewardTable rewards={rewards} adminPage={role === "admin"} />
            </div>
        </div>
    )
}