"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { showToast } from "@/utils"
import axios, { AxiosError } from "axios"
import { useUser } from "@/store"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { setToken } = useUser()
  const router = useRouter()

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
          router.push(username === "admin" ? "/admin" : "/home")
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 border border-gray-200">
        <h1 className="mb-6 text-xl font-normal text-center">Enter Username & Password to Start Betting</h1>
        <div>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-sm font-normal">
              Username
            </label>
            <input
              id="username"
              autoComplete="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300"
              required
            />
            <label htmlFor="username" className="block mb-2 text-sm font-normal mt-1">
              Password
            </label>
            <input
              id="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 mb-1"
              required
            />
          </div>
          <button onClick={handleLogin} className="w-full p-2 text-white bg-black hover:bg-black/80 cursor-pointer">
            Login
          </button>
          <div className="text-black/60 text-sm text-center my-7">Don&apos;t you have an account? <Link href="./register" className="text-black/80 underline">Sign up</Link></div>
        </div>
      </div>
    </div>
  )
}
