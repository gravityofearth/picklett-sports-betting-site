"use client"

import AvatarCrop from "@/components/AvatarCrop"
import { ClanType } from "@/types"
import { showToast } from "@/utils"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"

export default function Home() {
  const params = useParams()
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [isError, setError] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File>()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    if (!isClient) return
    if (!localStorage.getItem("jwt")) return
    axios.get(`/api/clan/${params.clanId}`, { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { clan: { title, icon, description } } }: { data: { clan: ClanType } }) => {
        setIcon(icon)
        setTitle(title)
        setDescription(description)
      })
  }, [isClient])
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
  const handleEdit = () => {
    if (description.trim() === "") {
      showToast("Enter clan description", "warn")
      return
    }
    if (icon.trim() === "") {
      showToast("Upload icon", "warn")
      return
    }
    setSending(true)
    axios.put(`/api/clan/${params.clanId}/edit`, { description, icon }, { headers: { token: localStorage.getItem("jwt") } })
      .then(() => {
        showToast("Edit clan info successfully!", "success")
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
          <div className="text-xl ">Edit Clan Info</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2 col-span-2">
            <div>Clan Name </div>
            <span className="w-full px-4 py-3 border border-white/20 rounded-lg" >{title}</span>
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
        <div className="flex flex-col gap-2">
          <div>Clan Description <span className="text-red-500">*</span></div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-white/20 rounded-lg" placeholder="Describe your clan’s goals, requirements, and playstyle..." />
          <div className="text-sm text-white/70">{description.length}/200 characters</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Link href="./members" className="w-full bg-[#0D111B] py-4 max-md:py-3 rounded-lg border border-white/20 cursor-pointer hover:bg-white/40 text-center">Cancel</Link>
          <button onClick={handleEdit} disabled={sending} className="w-full bg-[#1475E1] py-4 max-md:py-3 rounded-lg border border-[#1475E1] cursor-pointer hover:bg-[#5999e2] disabled:cursor-not-allowed disabled:bg-gray-800">Edit Clan</button>
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