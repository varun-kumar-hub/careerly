const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nomtuqsczbzoojmmzmia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbXR1cXNjemJ6b29qbW16bWlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAyODEzNiwiZXhwIjoyMDg0NjA0MTM2fQ.GN6juDhh6y_c7f43372c0c163820249764516109968846c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching jobs:', error);
    } else {
        console.log('Total Jobs in DB:', count);
    }
}

checkJobs();
