import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    console.log('[Server Client] Initializing Supabase Server Client');

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        console.log(`[Server Client] Setting ${cookiesToSet.length} cookies`);
                        cookiesToSet.forEach(({ name, value, options }) => {
                            console.log(`[Server Client] Cookie: ${name}, Options: ${JSON.stringify(options)}`);
                            cookieStore.set(name, value, options)
                        })
                    } catch (error) {
                        console.error('[Server Client] Error setting cookies:', error);
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
