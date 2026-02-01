import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Default redirect to /dashboard after successful auth
    let next = searchParams.get('next') ?? '/dashboard'

    // Security: ensure next is a relative path
    if (!next.startsWith('/')) {
        next = '/dashboard'
    }

    if (code) {
        // Track all cookies that need to be set on the response
        const cookiesToSet: Array<{ name: string; value: string; options: any }> = []

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookies) {
                        cookies.forEach((cookie) => {
                            cookiesToSet.push(cookie)
                        })
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Force getUser() to ensure cookies are set synchronously
            // The exchangeCodeForSession triggers async cookie setting
            await supabase.auth.getUser()

            // Determine the correct redirect URL
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            let redirectUrl: string
            if (isLocalEnv) {
                redirectUrl = `${origin}${next}`
            } else if (forwardedHost) {
                redirectUrl = `https://${forwardedHost}${next}`
            } else {
                redirectUrl = `${origin}${next}`
            }

            // Create redirect response with session cookies
            const response = NextResponse.redirect(redirectUrl)

            // First, clear any existing Supabase cookies to prevent accumulation
            const existingCookies = request.cookies.getAll()
            for (const cookie of existingCookies) {
                if (cookie.name.startsWith('sb-')) {
                    response.cookies.set(cookie.name, '', {
                        path: '/',
                        expires: new Date(0),
                        maxAge: 0,
                    })
                }
            }

            // Now set the fresh session cookies
            cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
            })

            return response
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
