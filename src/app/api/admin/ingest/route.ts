import { NextResponse } from "next/server";
import { ingestJobs } from "@/cron/ingestJobs";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/constants/adminEmails";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const result = await ingestJobs();
        return NextResponse.json({ success: true, result });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
