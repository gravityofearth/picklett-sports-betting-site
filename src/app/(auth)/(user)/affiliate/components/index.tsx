"use client"
import SumCard from "@/components/SumCard"
import { svgCopy, svgCopyOk } from "@/components/SVG"
import { AffiliateRewardType } from "@/types"
import { useState } from "react"
import AffiliateRewardTable from "./table"
export default function AffiliatePage({ params: { rewards, ref, role } }: {
    params: { rewards: AffiliateRewardType[], ref: string, role: string }
}) {
    const [copyContent, setCopyContent] = useState(svgCopy)
    const [copyStatus, setCopyStatus] = useState("Copy")
    const referralLink = `https://www.picklett.com/register?ref=${ref}`
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
            <div className="w-full flex flex-col gap-8">
                <div className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-medium text-2xl">Affilate Program</h1>
                        <p className="">Invite your friends to join our platform using the link below.&nbsp;&nbsp;As an affiliate, you will earn rewards every 5 days, once your referrals place bets exceeding $100 generating revenue for our site.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="">Your Affiliate Link</span>
                        <div className="flex items-center w-fit bg-white/10 rounded-lg py-3 px-4 gap-10">
                            <code onClick={() => copyToClipboard(referralLink)} className="font-mono break-all cursor-pointer w-fit underline">
                                {referralLink}
                            </code>
                            <button onClick={() => copyToClipboard(referralLink)} className="cursor-pointer flex gap-2 items-center">
                                {copyContent} {copyStatus}
                            </button>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-3 max-lg:grid-cols-1 gap-6 py-4">
                        <SumCard icon="money-dollar" amount={`$${rewards.reduce((prev, current) => (prev + current.earning), 0)}`} heading="Total Earnings" description="Lifetime affiliate earnings" color="#ffffff" />
                        <SumCard icon="money-dollar" amount={[...new Set(rewards.map(reward => reward.detail.map(v => v.referee)).reduce((prev, current) => ([...prev, ...current]), []))].length.toString()} heading=" Total Referrals" description="Active referred users" color="#ffffff" />
                        <SumCard icon="money-dollar" amount="5%" heading="Avg Commission" description="Average commission rate" color="#ffffff" />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <span className="text-2xl font-medium">Affiliate Rewards</span>
                        <span className="">Track your commission earnings by cycle</span>
                    </div>
                    <div className="p-4 rounded-3xl bg-[#0E1B2F]">
                        <AffiliateRewardTable rewards={rewards} adminPage={role === "admin"} />
                    </div>
                </div>
            </div>
        </div>
    )
}