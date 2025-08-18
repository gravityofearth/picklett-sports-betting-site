"use client"
import { svgCopy, svgCopyOk } from "@/components/SVG"
import { useUser } from "@/store"
import { useEffect, useState } from "react"

export default function AffiliatePage() {
    const [copyContent, setCopyContent] = useState(svgCopy)
    const [referralLink, setReferralLink] = useState("")
    const { ref } = useUser()
    useEffect(() => {
        if (!ref) return
        setReferralLink(`https://www.picklett.com/register?ref=${ref}`)
    }, [ref])
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
            <div className="text-center text-lg w-full p-4 border-4 border-gray-300 border-double">Spread the word!<br />Use your referral link to invite friends and collect rewards for every bet they make!</div>
            <div className="flex items-center justify-center">
                <code onClick={() => copyToClipboard(referralLink)} className="p-2 bg-gray-100 font-mono text-sm overflow-x-auto border-[1px] border-gray-400 cursor-pointer w-fit">
                    {referralLink}
                </code>
                <button onClick={() => copyToClipboard(referralLink)} className="p-2 ml-2 border border-gray-300 cursor-pointer rounded-md">
                    {copyContent}
                </button>
            </div>
        </div>
    )
}