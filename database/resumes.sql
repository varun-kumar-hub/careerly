-- Create a table for Resume Analysis Results
create table resume_analysis (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default now(),
  
  -- File Metadata
  file_path text not null, -- Path in Storage
  file_name text not null,
  file_type text not null,
  
  -- Phase 1: Deterministic Analysis
  extracted_text text, -- Full text content
  detected_sections jsonb, -- { "education": true, "experience": true, ... }
  extracted_skills text[], -- Matched skills
  structural_issues jsonb, -- ["missing_summary", "low_project_count"]
  
  -- Phase 2: AI Analysis (Optional)
  ai_enhanced boolean default false,
  ai_feedback jsonb -- { "issues": [], "suggestions": [] }
);

-- RLS for Resume Analysis
alter table resume_analysis enable row level security;

create policy "Users can view own resume analysis" on resume_analysis
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert own resume analysis" on resume_analysis
  for insert with check ((select auth.uid()) = user_id);
  
create policy "Users can delete own resume analysis" on resume_analysis
  for delete using ((select auth.uid()) = user_id);

-- Storage Policies (Buckets must be created via Dashboard usually, but policies here)
-- Bucket Name: 'resumes'
-- Make sure to create the bucket 'resumes' in Supabase Storage and make it private.

-- Policy: Authenticated users can upload
-- Note: You have to add these in the Storage > Policies section of Supabase Dashboard manually or via SQL if enabled.
-- Policy: "Allow authenticated uploads"
-- FOR: storage.objects
-- USING: bucket_id = 'resumes' AND auth.role() = 'authenticated'
-- WITH CHECK: bucket_id = 'resumes' AND auth.role() = 'authenticated'

-- Policy: "Users can view their own files"
-- USING: bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text
