"use client"
import { useState } from "react"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useUser } from "@/store"
import Link from "next/link"

export default function RegisterPage({ params: { ref } }: { params: { ref: string } }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { setToken } = useUser()
  const [confirmPassword, setConfirmPassword] = useState("")
  const [sendingBetRequest, setSendingBetRequest] = useState(false)
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
          router.push("/sports")
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
    <>
      {/* <div className="flex justify-center">
              <Link href="/home" className="w-12 h-12 flex items-center justify-center bg-[#01A3DB] rounded-full">
                <Image src="/favicon.ico" width={48} height={48} alt="logo" />
              </Link>
            </div> */}
      <span className="text-2xl font-medium w-full">Create An Account</span>
      <div className="w-full flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="block mb-2 text-sm">
            Username <span className="text-red-500">*</span>
          </label>
          <div className="bg-white/10 rounded-lg px-4 py-3">
            <input
              autoComplete="username"
              id="username"
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
              autoComplete="new-password"
              id="password"
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
        <div>
          <label htmlFor="password" className="block mb-2 text-sm">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-between items-center w-full px-4 py-3 rounded-lg bg-white/10">
            <input
              autoComplete="new-password"
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
              placeholder="Enter Password"
              required
            />
            <svg className="w-[18px] h-6 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}><use href={showConfirmPassword ? "#svg-password-hide" : "#svg-password-preview"} /></svg>
          </div>
        </div>
      </div>
      <button onClick={handleRegister} className="w-full p-3 font-semibold bg-[#1475E1] rounded-lg hover:bg-[#3885dd] cursor-pointer" disabled={sendingBetRequest}>
        Register
      </button>
      <div className="font-medium text-center">Do you have an account? <Link href="./login" className="text-white underline">Log in</Link></div>
    </>
  )
}