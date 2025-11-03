import { cookies } from 'next/headers'
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils"
import { redirect } from 'next/navigation';
export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get('jwt')?.value ?? ""
  let flag = true
  try {
    jwt.verify(token, JWT_SECRET)
  } catch (error) {
    flag = false
  }
  redirect(flag ? "/sports" : "/home")
}