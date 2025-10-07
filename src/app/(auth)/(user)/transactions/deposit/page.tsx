import DepositHistoryPage from "./DepositHistoryPage"
import Link from "next/link"

export default function Transactions() {
  return (
    <>
      <div className="flex gap-4">
        <button className={`px-5 py-2 rounded-md border cursor-pointer border-[#01A3DB] bg-[#01A3DB]`}>Deposit</button>
        <Link href="./withdraw" className={`px-5 py-2 rounded-md border cursor-pointer border-[#01A3DB]`}>Withdraw</Link>
      </div>
      <DepositHistoryPage />
    </>
  )
}