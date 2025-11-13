"use client"
import { WarFeedType } from "@/types"
import { formatAgo } from "@/utils"
import axios from "axios"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
export default function Page() {
  const params = useParams()
  const [feeds, setFeeds] = useState<WarFeedType[]>([])
  useEffect(() => {
    axios.get(`/api/clan/war/${params.warId}/feeds`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { feeds } }) => {
        setFeeds(feeds)
      })
  }, [])
  return <>{
    feeds.map((feed, i) => <WarFeed key={i} feed={feed} />)
  }</>
}
const WarFeed = ({ feed }: { feed: WarFeedType }) => {
  return (
    <div className="w-full p-4 max-md:p-2 rounded-2xl max-md:rounded-lg bg-[#1475E1]/10 flex max-md:flex-col gap-2 justify-between">
      <div className="flex gap-4 items-center">
        <Image alt="avatar" src={`/api/profile/avatar/${feed.avatar}`} width={64} height={64} className="shrink-0 rounded-[15px] w-[64px] h-[64px]" />
        <div className="flex flex-col gap-2">
          <span className="md:text-2xl">{feed.username}</span>
          <div className="max-md:text-xs">{feed.event}</div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div className={`text-lg rounded-lg max-md:text-sm py-1 px-2 ${feed.status === "win" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#EF4444]/20 text-[#EF4444]"}`}>{feed.status}</div>
        <p className="w-[120px] text-xl max-md:text-xs text-white/70 font-mediums">{formatAgo(new Date(feed.updatedAt).getTime())}</p>
      </div>
    </div>
  )
}