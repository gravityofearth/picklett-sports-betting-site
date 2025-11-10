"use client"

import AvatarCrop from "@/components/AvatarCrop"
import { useUser } from "@/store"
import { showToast } from "@/utils"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"

export default function Home() {
  const router = useRouter()
  const { balance } = useUser()
  const [sending, setSending] = useState(false)
  const [isError, setError] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File>()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const file_ref = useRef<HTMLInputElement>(null)
  const handleAvatarClick = () => {
    setError(false)
    file_ref.current?.click()
  }
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    setAvatarFile(files[0])
    event.target.value = ""
  }
  const handleCreate = () => {
    if (title.trim() === "") {
      showToast("Enter clan name", "warn")
      return
    }
    if (description.trim() === "") {
      showToast("Enter clan description", "warn")
      return
    }
    if (icon.trim() === "") {
      showToast("Upload icon", "warn")
      return
    }
    setSending(true)
    axios.post(`/api/clan/create`, { title, description, icon }, { headers: { token: localStorage.getItem("jwt") } })
      .then(() => {
        showToast("Created clan successfully!", "success")
        router.push("/clans")
      }).catch((e) => {
        showToast(e.response?.statusText || "Unknown Error", "error")
      }).finally(() => setSending(false))
  }
  return (
    <div className="flex justify-center">
      {avatarFile &&
        <div className="fixed left-0 right-0 top-0 bottom-0 flex justify-center bg-black z-50 overflow-y-auto">
          <div className="w-3xl max-w-full bg-black p-4">
            <AvatarCrop params={{
              avatarFile,
              closeModal: () => setAvatarFile(undefined),
              callback: (data) => setIcon(data.filename),
              api: "/api/clan/avatar",
            }} />
          </div>
        </div>
      }
      <div className="w-full max-w-3xl flex flex-col gap-6 max-md:text-xs">
        <div className="flex flex-col">
          <div className="text-xl ">Create Your Clan</div>
          <div className="text-white/80">Build your team and start competing</div>
        </div>
        <div className="rounded-xl border border-white/20 p-3 flex justify-between gap-4 bg-[#1C2534]">
          <div className="flex flex-col gap-2">
            <div className="">Clan Creation Fee: $50</div>
            <div className="text-sm text-white/80">As the clan leader, you'll be able to invite members, manage the coffer, and challenge other clans to wars.</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm text-nowrap">Your Balance</div>
            <div className="text font-bold">$ {balance.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>Clan Icon <span className="text-red-500">*</span></div>
          <div className="flex gap-6 items-center">
            <div className="rounded-xl bg-white/20 shrink-0 overflow-hidden">
              <ClanAvatar icon={icon} isError={isError} setError={setError} />
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleAvatarClick} className="w-fit px-3 py-2 bg-white flex gap-2 rounded-lg cursor-pointer hover:bg-white/80">
                <svg className="w-6 h-6 max-md:w-4 max-md:h-4"><use href="#svg-upload-image-button" /></svg>
                <div className="text-black ">Upload Icon</div>
              </button>
              <div className="text-sm max-md:text-xs">Upload a square image (recommended: 512x512px, max 5MB)<br />Supported formats: JPG, PNG, GIF, WebP</div>
              <div className="hidden">
                <input onChange={handleAvatarChange} type="file" name="file" ref={file_ref} />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2 col-span-2">
            <div>Clan Name <span className="text-red-500">*</span></div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full px-4 py-3 border border-white/20 rounded-lg" placeholder="Enter clan name (3-20 characters)" />
            <div className="text-sm text-white/70">{title.length}/20 characters</div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>Clan Description <span className="text-red-500">*</span></div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-white/20 rounded-lg" placeholder="Describe your clan’s goals, requirements, and playstyle..." />
          <div className="text-sm text-white/70">{description.length}/200 characters</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>Social Links</div>
            <div className="flex gap-2 items-center rounded-lg border border-[#F59E0B] bg-[#F59E0B]/8 p-2">
              <svg className="w-4 h-4"><use href="#svg-lock-new"></use></svg>
              <span className="text-[#F59E0B]">Unlock at Level 5</span>
            </div>
          </div>
          <div className="p-4 border border-white/20 rounded-2xl text-white/80 bg-[#1C2534]">Social links will be available once your clan reachesRank 5. Earn XP through wars and member activity to unlock this feature!</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2 items-center">
              <svg className="w-[30px] h-6"><use href="#svg-discord"></use></svg>
              <input type="text" className="w-full p-4 rounded-lg border border-white/20 text-sm" disabled />
            </div>
            <div className="flex gap-2 items-center">
              <svg className="w-[30px] h-6"><use href="#svg-x"></use></svg>
              <input type="text" className="w-full p-4 rounded-lg border border-white/20 text-sm" disabled />
            </div>
            <div className="flex gap-2 items-center">
              <svg className="w-[30px] h-6"><use href="#svg-twitch"></use></svg>
              <input type="text" className="w-full p-4 rounded-lg border border-white/20 text-sm" disabled />
            </div>
            <div className="flex gap-2 items-center">
              <svg className="w-[30px] h-6"><use href="#svg-youtube"></use></svg>
              <input type="text" className="w-full p-4 rounded-lg border border-white/20 text-sm" disabled />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Link href="." className="w-full bg-[#0D111B] py-4 max-md:py-3 rounded-lg border border-white/20 cursor-pointer hover:bg-white/40 text-center">Cancel</Link>
          <button onClick={handleCreate} disabled={sending || balance < 50} className="w-full bg-[#1475E1] py-4 max-md:py-3 rounded-lg border border-[#1475E1] cursor-pointer hover:bg-[#5999e2] disabled:cursor-not-allowed disabled:bg-gray-800">Create Clan ($50)</button>
        </div>
      </div>
    </div>
  )
}
const ClanAvatar = ({ icon, isError, setError }: { icon: string, isError: boolean, setError: Dispatch<SetStateAction<boolean>> }) => {
  return icon && !isError ?
    <Image onError={() => setError(true)} src={`/api/profile/avatar/${icon}`} className="w-24 h-24" width={96} height={96} alt="avatar" /> :
    <div className="p-6"><svg className="w-12 h-12"><use href="#svg-upload-image-placeholder" /></svg></div>
}