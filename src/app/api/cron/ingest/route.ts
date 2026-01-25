
import { createClient } from "@supabase/supabase-js";
import { ingestGlobalJobs } from "@/features/jobs/jobService";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for ingestion

export async function GET(request: Request) {
    // 1. Authorization Check (Simple Secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Run Ingestion (Admin Context)
        const count = await ingestGlobalJobs();

        return NextResponse.json({ success: true, newly_ingested: count });
    } catch (error: any) {
        console.error("Cron Ingestion Failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
