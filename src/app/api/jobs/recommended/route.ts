import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getRecommendedJobs, JobListing } from '@/features/jobs/jobService';
import { calculateMatchScore, MatchResult } from '@/features/matching/matcher';

export const dynamic = 'force-dynamic';

export interface RecommendedJob extends JobListing {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    explanation: string;
}

/**
 * GET /api/jobs/recommended
 * 
 * Returns jobs filtered and ranked by user skill match.
 * Requires authentication.
 * 
 * Returns only jobs with >0% skill overlap.
 * Ranked by match score (highest first).
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Fetch user skills from profile and resume
        const [profileResult, resumeResult] = await Promise.all([
            supabase
                .from('profiles')
                .select('skills')
                .eq('id', user.id)
                .single(),
            supabase
                .from('resume_analysis')
                .select('extracted_skills')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
        ]);

        const userSkills = [
            ...(profileResult.data?.skills || []),
            ...(resumeResult.data?.extracted_skills || [])
        ];

        // If user has no skills, return empty with message
        if (userSkills.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                jobs: [],
                message: 'Add skills to your profile to get personalized recommendations'
            });
        }

        // Fetch jobs and calculate match scores
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        const limit = parseInt(searchParams.get('limit') || '30', 10);

        const jobs = await getRecommendedJobs({
            type: type as 'job' | 'internship' | 'all',
            limit: 100, // Fetch more to filter
        });

        // Calculate match scores and filter
        const scoredJobs: RecommendedJob[] = [];

        for (const job of jobs) {
            const match = calculateMatchScore(
                `${job.title} ${job.description}`,
                userSkills
            );

            // Only include jobs with >0% match
            if (match.score > 0) {
                scoredJobs.push({
                    ...job,
                    matchScore: match.score,
                    matchedSkills: match.matchedSkills,
                    missingSkills: match.missingSkills.slice(0, 3), // Max 3 missing
                    explanation: match.explanation,
                });
            }
        }

        // Sort by match score (highest first)
        scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

        // Limit results
        const limitedJobs = scoredJobs.slice(0, limit);

        return NextResponse.json({
            success: true,
            count: limitedJobs.length,
            totalMatched: scoredJobs.length,
            jobs: limitedJobs,
        });
    } catch (error) {
        console.error('[API /jobs/recommended] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}
