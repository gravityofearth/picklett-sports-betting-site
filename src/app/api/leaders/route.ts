
import { genLeaders } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
    try {
        const leaders = await genLeaders()
        return NextResponse.json({ leaders }, { status: 200 });

    } catch (error: any) {
        console.error("Error in leaders:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
