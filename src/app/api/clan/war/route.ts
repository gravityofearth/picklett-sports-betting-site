import { findWars } from "@/controller/clan";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const wars = await findWars({})
        return NextResponse.json({ wars }, { status: 200 });
    } catch (error: any) {
        console.error("Error in get wars:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
    }
}
