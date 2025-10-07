"use client"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/store"

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>)
}
const Home = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [ref, setRef] = useState("")
  const { setToken } = useUser()
  const [confirmPassword, setConfirmPassword] = useState("")
  const [sendingBetRequest, setSendingBetRequest] = useState(false)
  const router = useRouter();
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    setRef(searchParams.get('ref') || "")
  }, [searchParams])
  const handleRegister = async () => {
    if (username?.trim() === "") {
      showToast("Invalid username", "warn")
      return
    }
    if (password?.trim() === "") {
      showToast("Invalid password", "warn")
      return
    }
    if (password !== confirmPassword) {
      showToast("Password mismatching", "warn")
      return
    }
    setSendingBetRequest(true)
    axios.post("/api/register", { username, password, ref: ref.trim() })
      .then(({ status, data: { token } }) => {
        if (status === 201) {
          setToken(token)
          showToast("Successfully registered!", "success")
          router.push("/user")
        }
      })
      .catch((e: AxiosError) => {
        console.log(e)
        switch (e.status) {
          case 400:
          case 409:
          case 500:
            showToast(e.response?.statusText || "Unknown Error", "error")
            break;
          default:
            showToast("Unknown Error", "error")
            break;
        }
      }).finally(() => setSendingBetRequest(false))
  }
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full flex flex-col gap-8 items-center max-w-96 p-6 border border-[#1E2939] bg-linear-to-r from-[#0077ff3f] via-[#00bfff67] to-[#0077ff3f] rounded-2xl">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center bg-[#01A3DB] rounded-full">
            <svg className="w-[18px] h-6"><use href="#svg-user-white" /></svg>
          </div>
          <h1 className="leading-8 pt-2 text-[22px] font-bold text-center">Create New Account</h1>
          <p className="text-[#D1D5DC]">You can create free account</p>
        </div>
        <div className="w-full">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-normal mt-1">
                Username
              </label>
              <input
                autoComplete="username"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#E5E5E599]"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-normal mt-1">
                Password
              </label>
              <div className="flex justify-between items-center w-full p-2 rounded-lg border border-[#E5E5E599]">
              <input
                autoComplete="new-password"
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
              />
                <svg className="w-[18px] h-6 cursor-pointer" onClick={()=>setShowPassword(!showPassword)}><use href={showPassword ? "#svg-password-hide" : "#svg-password-preview"} /></svg>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block mb-2 text-sm font-normal mt-1">
                Confirm Password
              </label>
              <div className="flex justify-between items-center w-full p-2 rounded-lg border border-[#E5E5E599]">
                <input
                  autoComplete="new-password"
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                  required
                />
                <svg className="w-[18px] h-6 cursor-pointer" onClick={()=>setShowConfirmPassword(!showConfirmPassword)}><use href={showConfirmPassword ? "#svg-password-hide" : "#svg-password-preview"} /></svg>
              </div>
            </div>
            <button onClick={handleRegister} className="w-full p-3 font-semibold bg-[#01A3DB] rounded-[10px] hover:bg-[#46b2d6] cursor-pointer border border-[#364153]" disabled={sendingBetRequest}>
              Register
            </button>
          </div>
          <div className="text-[#D1D5DC] font-semibold text-center my-7">Do you have an account? <Link href="./login" className="text-white underline">Log in</Link></div>
        </div>
      </div>
      <p className="text-[#D1D5DC] text-sm absolute bottom-20">© 2025 copyrights reserved by Picklett</p>
    </div>
  )
}
