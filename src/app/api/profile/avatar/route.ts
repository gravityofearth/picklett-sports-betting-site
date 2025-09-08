import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import connectMongoDB from "@/utils/mongodb";
import fs from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@/utils";
import { updateAvatar } from "@/controller/user";
import { signToken } from "@/controller/auth";

export async function POST(request: Request) {
  try {
    const token = request.headers.get('token') || '';
    const { username }: any = jwt.verify(token, JWT_SECRET)
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (files.length === 0) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    for (const file of files) {
      const extension = file.name.split(".").pop();

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `avatar-${Date.now()}.${extension}`
      // Save to /public/uploads (make sure this directory exists)
      const filePath = path.join(process.cwd(), "avatars", filename);
      await fs.writeFile(filePath, buffer);



      const updated_user = await updateAvatar({ username, avatar: filename })
      const new_token = signToken(updated_user)
      return NextResponse.json({ token: new_token }, { status: 200 });
    }

    // return NextResponse.json({ message: "Files uploaded successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
async function gridFSTemp(request: NextRequest): Promise<Response> {

  const db = (await connectMongoDB()).connection.db
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file found" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!db) return NextResponse.json({ success: false, filename: file.name });
  const bucket = new GridFSBucket(db, { bucketName: "avatars" });

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(file.name, {
      contentType: file.type,
    });

    uploadStream.end(buffer);

    uploadStream.on("error", (error) => {
      reject(NextResponse.json({ error: error.message }, { status: 500 }));
    });

    uploadStream.on("finish", () => {
      // uploadStream.id is the ObjectId of the uploaded file
      const fileId = uploadStream.id.toString(); // convert ObjectId to string

      resolve(
        NextResponse.json(
          { success: true, fileId, filename: file.name },
          { status: 201 }
        )
      );
    });
  });
}
