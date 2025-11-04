import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { ReceiveUploadedFile } from "../../profile/avatar/ReceiveUploadedFile";

export async function POST(request: Request) {
  try {
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const filename = await ReceiveUploadedFile(request, `clan-${username}`)
    return NextResponse.json({ filename }, { status: 200 })
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}