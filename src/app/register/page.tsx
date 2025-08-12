"use client"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [sendingBetRequest, setSendingBetRequest] = useState(false)
  const router = useRouter();
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
    axios.post("/api/register", { username, password })
      .then(({ status, data: { token } }) => {
        if (status === 201) {
          localStorage.setItem("jwt", token)
          showToast("Successfully registered!", "success")
          router.push("/home")
        }
      })
      .catch((e: AxiosError) => {
        console.log(e)
        switch (e.status) {
          case 400:
          case 409:
          case 500:
            showToast(e.response?.statusText, "error")
            break;
          default:
            showToast("Unknown Error", "error")
            break;
        }
      }).finally(() => setSendingBetRequest(false))

  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 border border-gray-200">
        <h1 className="mb-6 text-xl font-normal text-center">Enter Username & Password to Register</h1>
        <div>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-sm font-normal mt-1">
              Username
            </label>
            <input
              autoComplete="username"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 mb-1"
              required
            />
            <label htmlFor="password" className="block mb-2 text-sm font-normal mt-1">
              Password
            </label>
            <input
              autoComplete="new-password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 mb-1"
              required
            />
            <label htmlFor="confirm-password" className="block mb-2 text-sm font-normal mt-1">
              Confirm Password
            </label>
            <input
              autoComplete="new-password"
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 mb-1"
              required
            />
          </div>
          <button onClick={handleRegister} className="w-full p-2 text-white bg-black cursor-pointer hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/50" disabled={sendingBetRequest}>
            Register
          </button>
          <div className="text-black/60 text-sm text-center my-7">Do you have an account? <Link href="./login" className="text-black/80 underline">Log in</Link></div>
        </div>
      </div>
    </div>
  )
}
