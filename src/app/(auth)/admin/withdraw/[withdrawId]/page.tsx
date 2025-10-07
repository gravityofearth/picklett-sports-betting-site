import { WithdrawType } from "@/types"
import { cookies } from 'next/headers'
import AdminWithdrawId from "./components"
export default async function Page({ params }: { params: any }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  const { withdrawId } = await params
  const { withdraw, lockedPrice, vaultBalance: vaultBalance_origin }: { withdraw: WithdrawType, lockedPrice: number, vaultBalance: number }
    = await (await fetch(`http://localhost:3000/api/withdraw/${withdrawId}`, {
      headers: { token },
      cache: "no-store"
    })).json()
  const vaultBalance =
    withdraw.network === "Bitcoin" ?
      Math.ceil(vaultBalance_origin * lockedPrice / 10 ** 8 * 100) / 100 :
      0

  return (
    <AdminWithdrawId params={{ withdraw, vaultBalance }} />
  )
}