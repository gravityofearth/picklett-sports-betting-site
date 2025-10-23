"use client"

import { useUser } from "@/store"
import Image from "next/image"

export default function Home() {
  const { avatar } = useUser()
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="flex flex-col">
          <div className="text-xl ">Create Your Clan</div>
          <div className="text-white/80">Build your team and start competing</div>
        </div>
        <div className="rounded-xl border border-white/20 p-3 flex justify-between bg-[#1C2534]">
          <div className="flex flex-col">
            <div className="">Clan Creation Fee: $500</div>
            <div className="text-sm text-white/80">As the clan leader, you'll be able to invite members, manage the coffer, and challenge other clans to wars.</div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm">Your Balance</div>
            <div className="text font-bold">$1250</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>Clan Icon <span className="text-red-500">*</span></div>
          <div className="flex gap-6 items-center">
            <div className="rounded-xl bg-white/20 p-6">
              <svg className="w-12 h-12"><use href="#svg-upload-image-placeholder" /></svg>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-fit px-3 py-2 bg-white flex gap-2 rounded-lg cursor-pointer hover:bg-white/80">
                <svg className="w-6 h-6"><use href="#svg-upload-image-button" /></svg>
                <div className="text-black ">Upload Icon</div>
              </div>
              <div className="text-sm">Upload a square image (recommended: 512x512px, max 5MB)<br />Supported formats: JPG, PNG, GIF, WebP</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            <div>Clan Name <span className="text-red-500">*</span></div>
            <input type="text" className="w-full px-4 py-3 border border-white/20 rounded-lg" placeholder="Enter clan name (3-20 characters)" />
            <div className="text-sm text-white/70">0/20 characters</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>Clan Description <span className="text-red-500">*</span></div>
          <textarea className="w-full px-4 py-3 border border-white/20 rounded-lg" placeholder="Describe your clan’s goals, requirements, and playstyle..." />
          <div className="text-sm text-white/70">0/200 characters</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>Social Links</div>
            <div className="flex gap-2 items-center rounded-lg border border-[#F59E0B] bg-[#F59E0B]/8 p-2">
              <svg className="w-4 h-4"><use href="#svg-lock-new"></use></svg>
              <span className="text-[#F59E0B]">Unload at Level 5</span>
            </div>
          </div>
          <div className="p-4 border border-white/20 rounded-2xl text-white/80 bg-[#1C2534]">Social links will be available once your clan reachesRank 5. Earn XP through wars and member activity to unlock this feature!</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2 items-center">
              <svg className="w-[30px] h-6"><use href="#svg-discord"></use></svg>
              <input type="text" className="w-full p-4 rounded-lg border border-white/20 text-sm" />
            </div>
            <div className="flex gap-2 items-center">
              <svg className="w-[30px] h-6"><use href="#svg-x"></use></svg>
              <input type="text" className="w-full p-4 rounded-lg border border-white/20 text-sm" />
            </div>
            <div className="flex gap-2 items-center">
              <svg className="w-[30px] h-6"><use href="#svg-twitch"></use></svg>
              <input type="text" className="w-full p-4 rounded-lg border border-white/20 text-sm" />
            </div>
            <div className="flex gap-2 items-center">
              <svg className="w-[30px] h-6"><use href="#svg-youtube"></use></svg>
              <input type="text" className="w-full p-4 rounded-lg border border-white/20 text-sm" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>Clan Visibility</div>
          <div className="flex gap-4 items-center">
            <Image alt="avatar" src={`/api/profile/avatar/${avatar}`} width={64} height={64} className="shrink-0 rounded-lg w-[64px] h-[64px]" />
            <div className="flex flex-col gap-1">
              <div className="text-2xl">Elite Bettors</div>
              <div className="text-white/70">Top-ranked clan seeking experienced bettors with 60%+ win rate</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="w-full bg-[#0D111B] py-4 rounded-lg border border-white/20 cursor-pointer hover:bg-white/40">Cancel</button>
          <button className="w-full bg-[#1475E1] py-4 rounded-lg border border-[#1475E1] cursor-pointer hover:bg-[#5999e2]">Create Clan ($100)</button>
        </div>
      </div>
    </div>
  )
}