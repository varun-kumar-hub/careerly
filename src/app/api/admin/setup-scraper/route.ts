
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/constants/adminEmails";

export async function GET(_request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // SQL to create table
    // Note: This relies on Supabase RPC or direct SQL execution capabilities which might be limited.
    // However, if we can't run DDL, we'll try to use the 'rpc' method if a 'exec_sql' function exists, 
    // or we guide the user to run it in Supabase Dashboard.

    // For now, let's try to just initialize data assuming table exists, 
    // OR return the SQL for the user to run.

    const sql = `
    CREATE TABLE IF NOT EXISTS job_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        last_scraped_at TIMESTAMPTZ,
        active BOOLEAN DEFAULT TRUE
    );
    
    ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS source_hash TEXT;
    CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);
    CREATE INDEX IF NOT EXISTS idx_jobs_source_hash ON jobs(source_hash);
    `;

    return NextResponse.json({
        message: "Please run this SQL in your Supabase SQL Editor to setup the scraper:",
        sql: sql
    });
}
