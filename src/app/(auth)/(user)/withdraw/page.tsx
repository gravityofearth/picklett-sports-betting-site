import { cookies } from 'next/headers'
import Withdraw from './components'
export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  const dpVsBt: { deposit: number; bet: number; } = await (await fetch('http://localhost:3000/api/withdraw/condition', {
    headers: { token },
    cache: "no-store"
  })).json()
  return (
    <Withdraw params={{ dpVsBt }} />
  )
}