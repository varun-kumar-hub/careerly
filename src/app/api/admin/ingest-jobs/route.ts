import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/constants/adminEmails";
import { ingestGlobalJobs } from "@/features/jobs/jobService";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check admin access
    if (!user || !isAdminEmail(user.email)) {
        return NextResponse.json(
            { error: "Unauthorized. Admin access required." },
            { status: 403 }
        );
    }

    try {
        console.log("[Admin] Starting job ingestion...");
        const count = await ingestGlobalJobs();
        console.log(`[Admin] Job ingestion complete. ${count} jobs processed.`);

        return NextResponse.json({
            success: true,
            message: `Job database refreshed. ${count} jobs ingested.`,
            count
        });
    } catch (error) {
        console.error("[Admin] Job ingestion error:", error);
        return NextResponse.json(
            { error: "Failed to refresh job database" },
            { status: 500 }
        );
    }
}
