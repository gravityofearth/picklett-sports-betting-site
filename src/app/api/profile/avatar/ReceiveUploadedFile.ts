import fs from "fs/promises";
import path from "path";
export async function ReceiveUploadedFile(request: Request, prefix: string) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("file") as File[];

        if (files.length === 0) {
            throw Error("No files uploaded")
        }
        const file = files[0]
        // for (const file of files) {
        const extension = file.name.split(".").pop();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = `${prefix}-${Date.now()}.${extension}`
        // Save to /public/uploads (make sure this directory exists)
        const filePath = path.join(process.cwd(), "avatars", filename);
        await fs.writeFile(filePath, buffer);
        // } NOTE: END OF for (const file of files) {

        // return NextResponse.json({ message: "Files uploaded successfully" });
        return filename
    } catch (error) {
        console.error(error);
        throw error
    }
}