import type React from "react"
import WithdrawHistoryPage from "@/components/WithdrawHistoryPage"
import Link from "next/link"

export default function Transactions() {
  return (
    <>
      <div className="flex gap-4">
        <Link href="./deposit" className={`px-5 py-2 rounded-md border cursor-pointer border-[#01A3DB]`}>Deposit</Link>
        <button className={`px-5 py-2 rounded-md border cursor-pointer border-[#01A3DB] bg-[#01A3DB]`}>Withdraw</button>
      </div>
      <WithdrawHistoryPage />
    </>
  )
}