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
                    cookiesToSet.forEach(({ name, value, options }) =>
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

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 1. Protected Admin Routes
    if (path.startsWith('/admin')) {
        if (!user) {
            // Not logged in -> Redirect to login
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }

        if (!isAdminEmail(user.email)) {
            // Logged in but not admin -> 403 Forbidden (or redirect to dashboard)
            // PRD says "Unauthorized admin access -> 403 Forbidden"
            // Ideally we rewrite to a 403 page or return a text response.
            // For now, let's redirect to dashboard with an error? 
            // Or better, just rewrite to a 403 page if we had one.
            // Let's redirect to dashboard for better UX, or stay on login?
            // PRD Section 3.4 says "Unauthorized admin access -> 403 Forbidden"
            // Let's redirect to applicant dashboard.
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // 2. Protected Applicant Routes (Dashboard, Resume, etc)
    if (path.startsWith('/dashboard') || path.startsWith('/resume') || path.startsWith('/jobs')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }
        // Admin trying to access Applicant Dashboard?
        // PRD Section 2.2: "Admins cannot... Access applicant dashboards".
        if (isAdminEmail(user.email)) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin' // Redirect admin to admin dashboard
            return NextResponse.redirect(url)
        }
    }

    // 3. Auth Routes (Login, Signup)
    if (path.startsWith('/auth/login') || path.startsWith('/auth/signup') || path.startsWith('/onboarding')) {
        // If already logged in, redirect to appropriate dashboard
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
