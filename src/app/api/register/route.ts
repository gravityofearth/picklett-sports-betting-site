import { signToken } from "@/controller/auth";
import { createUser, findUserByRef } from "@/controller/user";
import { generateVerificationToken, getCookieResponse } from "@/utils";
import { sendVerifyEmail } from "@/utils/emailjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, ref } = await request.json()
    if (!username || !password) return NextResponse.json({ error: "Invalid username/password" }, { status: 400, statusText: "Invalid username/password" })
    if (!email || !/^.+@.+\..+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400, statusText: "Invalid username/password" })
    const referrer = await findUserByRef(ref.trim())
    const emailVerificationToken = generateVerificationToken()
    const user = await createUser({ username, email, emailVerificationToken, password, refby: referrer?.username })
    sendVerifyEmail({ email: email.trim(), username, link: `https://www.picklett.com/api/email-verify?code=${emailVerificationToken}` })
    const token = signToken(user)
    return getCookieResponse({
      response: NextResponse.json({ token }, { status: 201 }),
      token,
    })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    if (error.code === 11000) return NextResponse.json({ error: "Duplicate username" }, { status: 409, statusText: "Username already in use, please choose another" });
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
