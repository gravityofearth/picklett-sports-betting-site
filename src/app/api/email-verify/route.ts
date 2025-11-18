import { findUserByEmailVerificationToken } from "@/controller/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        if (!code) throw new Error()
        const user = await findUserByEmailVerificationToken(code)
        if (!user) throw new Error()
        return NextResponse.redirect('https://www.picklett.com/email-verify/success');
    } catch (error: any) {
        console.error("Error in verifying email:", error);
        return NextResponse.redirect('https://www.picklett.com/email-verify/failed');
    }
}
