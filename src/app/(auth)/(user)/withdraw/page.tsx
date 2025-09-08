"use client"

import type React from "react"
import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { showToast, validateCurrency, validateEthAddress } from "@/utils"
import axios, { AxiosError } from "axios"
import WithdrawTable from "@/components/WithdrawTable"
import { WithdrawType } from "@/types"
import { useUser } from "@/store"
import SumCard from "@/components/SumCard"

export default function WithdrawPage() {
  const { username } = useUser()
  const [withdraws, setWithdraws] = useState<WithdrawType[]>([])
  const [showModal, setShowModal] = useState(false)
  useEffect(() => {
    axios.get("/api/withdraw", { headers: { token: localStorage.getItem("jwt") } })
      .then(({ data: { withdraw } }) => {
        setWithdraws(withdraw)
      })
  }, [])
  return (
    <div className="flex justify-center">
      {showModal && <WithdrawModal setShowModal={setShowModal} setWithdraws={setWithdraws} />}
      <div className={`w-full max-w-7xl flex flex-col gap-6 ${showModal && "blur-[2px]"}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-[26px] text-[#D9D9D9]">Withdraw Funds</h1>
            <p className="text-[#99A1AF]">Please have your money through withdrawl</p>
          </div>
          <button onClick={() => setShowModal(true)} className="text-sm px-4 py-2 rounded-lg bg-[#01A3DB] cursor-pointer hover:bg-[#3290af]">Withdraw</button>
        </div>
        <div className="w-full grid grid-cols-3 max-md:grid-cols-1 gap-6">
          <SumCard icon="redeem" amount={withdraws.filter(v => v.result === "success").length.toString()} heading="Success" description="Completed withdrawals" color="#00D492" />
          <SumCard icon="pending" amount={withdraws.filter(v => v.result === "requested").length.toString()} heading="Pending" description="Processing withdrawals" color="#FFBA00" />
          <SumCard icon="failed" amount={withdraws.filter(v => v.result === "failed").length.toString()} heading="Fail" description="Unsuccessful attempts" color="#FF6467" />
        </div>
        {username && <WithdrawTable withdraws={withdraws} username={username} />}
        <div className="w-full flex max-md:flex-col gap-2 justify-between bg-linear-to-r from-[#1018284D] to-[#1E293933] p-6 rounded-[10px] border border-[#3641534D]">
          <div className="flex flex-col justify-between">
            <p>Need Help?</p>
            <p className="text-sm text-[#99A1AF]">If you have any questions about your withdrawals, please contact our support team.</p>
          </div>
          <button className="py-4 px-6 border border-[#01A3DB] rounded-xl">Contact Support</button>
        </div>
      </div>
    </div>
  )
}

const WithdrawModal = ({ setShowModal, setWithdraws }: { setShowModal: Dispatch<SetStateAction<boolean>>, setWithdraws: Dispatch<SetStateAction<WithdrawType[]>> }) => {
  const { balance } = useUser()
  const [wallet, setWallet] = useState("")
  const [amount, setAmount] = useState("")
  const [sendingRequest, setSendingRequest] = useState(false)
  const handleWithdraw = () => {
    const withdrawAmount = Number.parseFloat(amount)
    if (!validateEthAddress(wallet)) {
      showToast("Enter address correctly!", "warn")
      return
    }
    if (Number.isNaN(withdrawAmount)) {
      showToast("Enter withdraw amount!", "warn")
      return
    }
    if (withdrawAmount < 20) {
      showToast("Minimum withdrawl amount $20", "warn")
      return
    }
    if (withdrawAmount > balance) {
      showToast("Insufficient balance for withdrawl", "warn")
      return
    }
    setSendingRequest(true)
    axios.post("/api/withdraw", {
      wallet,
      amount: Number(amount),
    }, { headers: { token: localStorage.getItem("jwt") } }).then(({ status, data: { withdraw } }) => {
      if (status === 201) {
        setWithdraws(v => ([withdraw, ...v]))
        // router.push(`/withdraw/${withdraw._id}`)
      }
    }).catch((e: AxiosError) => {
      showToast(e.response?.statusText || "Unknown Error", "error")
    }).finally(() => setSendingRequest(false))
    showToast("Withdrawal request submitted successfully", "success")
    setWallet("")
    setAmount("")
    setShowModal(false)
  }
  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 flex justify-center items-center z-50">
      <div className="relative w-full max-w-md flex flex-col items-center gap-6 border border-[#6e7b99] p-6 rounded-[10px] bg-[#101420]">
        <button className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowModal(false)}>
          <svg className="w-4 h-4">
            <use href="#svg-close" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Withdraw</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="senderAddress" className="block text-sm font-semibold">
              Your Wallet Address (<span className="text-[#FF7076]">Only Ethereum address is allowed!</span>)
            </label>
            <input
              id="senderAddress"
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value.trim())}
              className="w-full p-2 border border-[#E5E5E566] rounded-lg disabled:text-[#E5E5E566] text-sm"
              placeholder="0x..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="depositAmount" className="block text-sm font-semibold">
              Withdraw Amount (<span className="text-[#FF7076]">Minimum withdrawal $20</span>)
            </label>
            <div className="flex items-center rounded-lg border border-[#E5E5E566] p-2">
              <span className="text-sm">$</span>
              <input
                id="depositAmount"
                type="text"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === "" || validateCurrency(v)) {
                    setAmount(v)
                  } else if (v === ".") {
                    setAmount("0.")
                  }
                }}
                className="w-full px-2 border border-gray-300 text-sm border-none disabled:text-[#E5E5E566]"
                placeholder="0.00"
              />
            </div>
          </div>
          <button onClick={handleWithdraw} className="w-full py-2 bg-[#01A3DB] hover:bg-[#45bce4] cursor-pointer disabled:cursor-not-allowed border border-[#364153] rounded-[10px] text-sm font-semibold" disabled={sendingRequest}>
            Request Withdrawal
          </button>
          <p className="text-xs text-[#FCC800]">Withdrawals are processed manually within 24h.</p>
        </div>
      </div>
    </div>
  )
}