"use client"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { useUser } from "@/store"
import Link from "next/link"

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>)
}
function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { setToken } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const handleLogin = () => {
    if (username?.trim() === "") {
      showToast("Invalid username", "warn")
      return
    }
    if (password?.trim() === "") {
      showToast("Invalid password", "warn")
      return
    }
    axios.post("/api/login", { username, password })
      .then(({ status, data: { token } }) => {
        if (status === 200) {
          setToken(token)
          const target = searchParams.get("redirect")
          router.push(target || `/sports`)
        }
      })
      .catch((e: AxiosError) => {
        console.log(e)
        switch (e.status) {
          case 400:
          case 500:
            showToast(e.response?.statusText || "Unknown Error", "error")
            break;
          default:
            showToast("Unknown Error", "error")
            break;
        }
      })
  }
  return (
    <>
      <span className="text-2xl font-medium w-full">Log in to Picklett</span>
      <div className="w-full flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="block mb-2 text-sm">
            Username <span className="text-red-500">*</span>
          </label>
          <div className="bg-white/10 rounded-lg px-4 py-3">
            <input
              id="username"
              autoComplete="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              placeholder="Enter Username"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-between items-center w-full px-4 py-3 rounded-lg bg-white/10">
            <input
              id="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="Enter Password"
              required
            />
            <svg className="w-[18px] h-6 cursor-pointer" onClick={() => setShowPassword(!showPassword)}><use href={showPassword ? "#svg-password-hide" : "#svg-password-preview"} /></svg>
          </div>
        </div>
      </div>
      <button onClick={handleLogin} className="w-full p-3 font-semibold bg-[#1475E1] rounded-lg hover:bg-[#3885dd] cursor-pointer">
        Login
      </button>
      <div className="font-medium text-center">Don&apos;t you have an account? <Link href="./register" className="text-white underline">Sign up</Link></div>
    </>
  )
}
