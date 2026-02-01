-- Create a table for job applications
create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  job_title text not null,
  company_name text not null,
  job_url text,
  location text,
  salary_range text,
  
  status text check (status in ('saved', 'applied', 'interviewing', 'offer', 'rejected')) default 'applied',
  applied_date timestamp with time zone default now(),
  notes text
);

-- Enable RLS
alter table applications enable row level security;

-- Policies
create policy "Users can view their own applications." on applications
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own applications." on applications
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own applications." on applications
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own applications." on applications
  for delete using ((select auth.uid()) = user_id);
