import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/constants/adminEmails'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: auth.getUser() refreshes the session and is more secure
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 1. Protected Admin Routes
    if (path.startsWith('/admin')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }

        if (!isAdminEmail(user.email)) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // 2. Protected Applicant Routes (require login)
    if (path.startsWith('/dashboard') || path.startsWith('/resume') || path.startsWith('/jobs') ||
        path.startsWith('/cover-letter') || path.startsWith('/interview') || path.startsWith('/skill-gap') ||
        path.startsWith('/profile') || path.startsWith('/onboarding') || path.startsWith('/applications')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }
    }

    // 3. Auth Routes - redirect logged-in users to dashboard (but NOT onboarding)
    if (path.startsWith('/auth/login') || path.startsWith('/auth/signup')) {
        if (user) {
            const url = request.nextUrl.clone()
            if (isAdminEmail(user.email)) {
                url.pathname = '/admin'
            } else {
                url.pathname = '/dashboard'
            }
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
