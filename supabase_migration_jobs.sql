-- Create a table for Jobs and Internships
create table jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Core Job Data (Normalized)
  title text not null,
  company text not null,
  location text,
  description text, -- Full HTML or Markdown
  url text not null,
  
  -- Metadata
  source text not null, -- 'adzuna', 'remotive', 'jooble'
  source_id text, -- ID from the external API for dedupe
  posted_date timestamp with time zone,
  
  -- Filters
  job_type text check (job_type in ('job', 'internship')),
  work_mode text check (work_mode in ('remote', 'onsite', 'hybrid')),
  salary_min numeric,
  salary_max numeric,
  currency text default 'USD',
  
  -- Deduplication constraint
  constraint unique_job_source unique (source, source_id)
);

-- RLS
alter table jobs enable row level security;

-- Everyone can view jobs
create policy "Public jobs are viewable by everyone." on jobs
  for select using (true);

-- Only Admins can insert/update/delete (enforced by middleware/backend logic mostly, 
-- but decent to have RLS if we had a dedicated admin role in auth.users, 
-- however we use email allowlist in app logic. For DB safety, we could rely on service role key for ingestion 
-- or write a matching policy if we stored role in metadata.)
-- For now, we will assume Ingestion runs via Service Role or Admin Context.
-- We'll allow read-only for public. Writes blocked for public.
