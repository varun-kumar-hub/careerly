const { createClient } = require('@supabase/supabase-js');

// Trying to read from process.env if available, otherwise using the one from previous output (caution: might be expired/wrong, but worth a shot)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nomtuqsczbzoojmmzmia.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", supabaseUrl);
console.log("Key available:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    console.log("Checking jobs...");
    const { count, error, data } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching jobs count:', error);
    } else {
        console.log('Total Jobs in DB (Head):', count);
    }

    // Check top 5 jobs to see dates and types
    const { data: jobs, error: err2 } = await supabase
        .from('jobs')
        .select('id, title, posted_date, job_type')
        .limit(5)
        .order('posted_date', { ascending: false });

    if (err2) {
        console.error("Error fetching rows:", err2);
    } else {
        console.log("Sample Jobs:", jobs);
    }
}

checkJobs();
