import { getCookieResponse } from "@/utils";
import { NextResponse } from "next/server";

export async function GET() {
    return getCookieResponse({
        response: NextResponse.json("logout", { status: 200 }),
        token: "",
    })
}