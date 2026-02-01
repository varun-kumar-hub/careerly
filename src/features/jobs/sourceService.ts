
import { createClient } from "@/utils/supabase/server";

export interface JobSource {
    id: string;
    name: string;
    last_scraped_at: string | null;
    active: boolean;
}

export const SOURCES = [
    { id: 'adzuna', name: 'Adzuna' },
    { id: 'jooble', name: 'Jooble' },
    { id: 'remotive', name: 'Remotive' }
];

export async function getSources(): Promise<JobSource[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('job_sources')
        .select('*')
        .order('id');

    if (error) {
        console.error("Error fetching sources:", error);
        return [];
    }
    return data || [];
}

export async function updateSourceLastScraped(sourceId: string, date: Date) {
    const supabase = await createClient();
    await supabase
        .from('job_sources')
        .update({ last_scraped_at: date.toISOString() })
        .eq('id', sourceId);
}

export async function initializeSources() {
    const supabase = await createClient();

    // Check if table exists (by trying to select)
    const { error } = await supabase.from('job_sources').select('id').limit(1);

    if (error && error.code === '42P01') { // Undefined table
        // We can't Create Table from here easily without SQL access or migration capabilities exposed.
        // Assuming the user needs to create this table. 
        // I will provide a Setup Route to do this if possible via RPC or just inform the user.
        console.warn("job_sources table might be missing.");
        return { success: false, error: "Table missing" };
    }

    // Upsert default sources
    const { error: upsertError } = await supabase
        .from('job_sources')
        .upsert(
            SOURCES.map(s => ({
                id: s.id,
                name: s.name,
                active: true
                // last_scraped_at is left as is if exists, or null if new
            })),
            { onConflict: 'id', ignoreDuplicates: true }
            // We use ignoreDuplicates=true to NOT overwrite existing last_scraped_at
        );

    if (upsertError) {
        console.error("Failed to init sources:", upsertError);
        return { success: false, error: upsertError.message };
    }

    return { success: true };
}
