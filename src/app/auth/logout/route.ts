import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url), {
        status: 302,
    })

    // Create supabase client to perform sign out
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Sign out from Supabase (this will set cookies to expire)
    await supabase.auth.signOut()

    // Get all cookies and explicitly delete any Supabase-related ones
    const allCookies = request.cookies.getAll()

    for (const cookie of allCookies) {
        // Delete all Supabase auth cookies (they start with 'sb-')
        if (cookie.name.startsWith('sb-')) {
            response.cookies.set(cookie.name, '', {
                path: '/',
                expires: new Date(0),
                maxAge: 0,
            })
        }
    }

    return response
}

// Also support GET for direct navigation/link clicks
export async function GET(request: NextRequest) {
    return POST(request)
}
