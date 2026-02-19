require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", supabaseUrl);
console.log("Key available:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    console.log("Checking jobs...");
    const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching jobs count:', error);
    } else {
        console.log('Total Jobs in DB (Head):', count);
    }

    // Check top 5 jobs
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
