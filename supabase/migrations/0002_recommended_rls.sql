-- Recommended RLS policies. DO NOT run this blindly.
-- First check Supabase Dashboard > Authentication > Policies (or run the SELECT
-- query below) to see what's already configured. The app only filters by
-- `user_id` on the client, which is NOT a security boundary by itself — without
-- RLS enabled, any authenticated user can read/write any other user's rows.
--
-- Check current state first:
--   select tablename, rowsecurity from pg_tables where schemaname = 'public'
--     and tablename in ('companies','company_memos','todos','self_analysis');
--   select * from pg_policies where schemaname = 'public';

alter table companies enable row level security;
alter table company_memos enable row level security;
alter table todos enable row level security;
alter table self_analysis enable row level security;

drop policy if exists "companies_owner_all" on companies;
create policy "companies_owner_all" on companies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "company_memos_owner_all" on company_memos;
create policy "company_memos_owner_all" on company_memos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "todos_owner_all" on todos;
create policy "todos_owner_all" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "self_analysis_owner_all" on self_analysis;
create policy "self_analysis_owner_all" on self_analysis
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
