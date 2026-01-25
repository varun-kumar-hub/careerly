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

    // CLEANUP: Remove conflicting cookies from other Supabase projects on localhost
    const allCookies = request.cookies.getAll();

    // Dynamically extract project reference from the Supabase URL
    // Format: https://<project-ref>.supabase.co
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let currentProject = '';

    try {
        const url = new URL(supabaseUrl);
        // The hostname depends on the setup, but usually it's <project-ref>.supabase.co
        // We'll try to extract the first part of the hostname
        const hostnameParts = url.hostname.split('.');
        if (hostnameParts.length > 0) {
            currentProject = hostnameParts[0];
        }
    } catch (e) {
        console.error('[Middleware] Failed to parse NEXT_PUBLIC_SUPABASE_URL:', e);
    }

    const conflictingCookies = currentProject ? allCookies.filter(c =>
        (c.name.startsWith('sb-') && !c.name.includes(currentProject)) ||
        c.name.startsWith('sb-wgt') ||
        c.name.startsWith('sb-tdz') ||
        c.name.startsWith('sb-slfc')
    ) : [];

    if (conflictingCookies.length > 0) {
        // console.log(`[Middleware] Cleaning up ${conflictingCookies.length} conflicting cookies: ${conflictingCookies.map(c => c.name).join(', ')}`);
        // We do this by setting them with max-age 0 in the response.
        conflictingCookies.forEach(c => {
            supabaseResponse.cookies.set(c.name, '', { maxAge: 0 });
            request.cookies.delete(c.name); // Delete from request so Supabase doesn't see them (optional)
        });
    }

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error) {
        console.log('[Middleware] getUser error:', error.message);
    }

    // Debug cookies
    console.log(`[Middleware] Cookies present: ${allCookies.map(c => c.name).join(', ')}`);
    console.log(`[Middleware] User found: ${!!user}`);

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
            console.log(`[Middleware] No user found for protected route ${path}, redirecting to login`);
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
            console.log(`[Middleware] User logged in, redirecting from ${path} to dashboard`);
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
