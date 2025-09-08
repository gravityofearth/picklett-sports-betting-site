import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
export async function GET(request: NextRequest, { params }: { params: any }) {
    const { avatar } = await params;
    const filePath = path.resolve("avatars", avatar);

    if (!fs.existsSync(filePath)) {
        return new Response("File not found", { status: 404 });
    }
    const fileStream = fs.createReadStream(filePath);
    const webStream = streamToWebReadable(fileStream);

    return new Response(webStream,
        // { headers: { "Content-Type": "image/png" } }
    );
}
function streamToWebReadable(readStream: fs.ReadStream): ReadableStream<Uint8Array> {
    const reader = readStream[Symbol.asyncIterator]();

    return new ReadableStream({
        async pull(controller) {
            try {
                const { done, value } = await reader.next();
                if (done) {
                    controller.close();
                } else {
                    controller.enqueue(value);
                }
            } catch (error) {
                controller.error(error);
            }
        },
        cancel() {
            readStream.destroy();
        },
    });
}