import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { searchJobs, JobListing } from '@/features/jobs/jobService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/all
 * 
 * Returns ALL jobs without skill-based filtering.
 * Ordered by posted_date DESC (newest first).
 * 
 * Supports manual filters:
 * - type: 'job' | 'internship' | 'all'
 * - location: string (partial match)
 * - q: keyword search
 * - limit: number (default 50)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const type = (searchParams.get('type') || 'all') as 'job' | 'internship' | 'all';
        const location = searchParams.get('location') || '';
        const query = searchParams.get('q') || '';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        // searchJobs(query, location, country, workMode, maxDays, type)
        const jobs = await searchJobs(
            query,
            location,
            'in', // Default country
            undefined, // Work mode
            30, // Default 30 days
            type
        );

        return NextResponse.json({
            success: true,
            count: jobs.length,
            jobs,
        });
    } catch (error) {
        console.error('[API /jobs/all] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}
