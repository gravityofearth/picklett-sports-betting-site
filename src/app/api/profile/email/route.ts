import { signToken } from "@/controller/auth";
import jwt from "jsonwebtoken"
import { generateVerificationToken, getCookieResponse, JWT_SECRET } from "@/utils";
import { sendVerifyEmail } from "@/utils/emailjs";
import { NextRequest, NextResponse } from "next/server";
import { changeUserEmail } from "@/controller/user";

export async function PUT(request: NextRequest) {
  try {
    const { email } = await request.json()
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    if (!email || !/^.+@.+\..+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400, statusText: "Invalid username/password" })
    const emailVerificationToken = generateVerificationToken()
    const user = await changeUserEmail({ username, email, emailVerificationToken })
    sendVerifyEmail({ email: email.trim(), username, link: `https://www.picklett.com/api/email-verify?code=${emailVerificationToken}` })
    const new_token = signToken(user)
    return getCookieResponse({
      response: NextResponse.json({ token: new_token }, { status: 201 }),
      token,
    })
  } catch (error: any) {
    console.error("Error processing commissions:", error);
    if (error.code === 11000) return NextResponse.json({ error: "Duplicate username" }, { status: 409, statusText: "Username already in use, please choose another" });
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}
