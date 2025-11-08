import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/";

    if (code) {
        try {
            const supabase = getSupabaseServerClient();
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                // Redirect to sign-in with error (client will show toast)
                return NextResponse.redirect(
                    `${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent(error.message)}`
                );
            }

            if (data.session) {
                // Successfully authenticated, redirect to intended page with success flag
                const nextUrl = new URL(`${requestUrl.origin}${next}`);
                nextUrl.searchParams.set("auth", "success");
                return NextResponse.redirect(nextUrl.toString());
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent(message)}`);
        }
    }

    // No code provided, redirect to sign-in
    return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in`);
}
