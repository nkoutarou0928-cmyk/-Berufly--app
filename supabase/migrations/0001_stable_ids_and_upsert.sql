-- Stabilize row identity so the app can upsert instead of delete-all + insert-all.
-- Safe to run multiple times (idempotent). Run this in the Supabase SQL Editor.
--
-- Background: companies/todos previously had no app-generated id column, so every
-- save wiped and re-inserted all rows for the user, and company_memos was joined
-- to companies by `name` (breaks on duplicate company names). This migration adds
-- a stable `app_id` column (matching the id already generated client-side, e.g.
-- "co-1732000000000") to companies/company_memos/todos, backfills it from existing
-- data where possible, and adds unique indexes so the app can use upsert(onConflict).

-- ------------------------------------------------------------------
-- 1. self_analysis: already keyed by (user_id, title) in practice.
--    Add the unique index explicitly so upsert(onConflict: 'user_id,title') works.
-- ------------------------------------------------------------------
create unique index if not exists ux_self_analysis_user_title
  on self_analysis (user_id, title);

-- ------------------------------------------------------------------
-- 2. companies: add app_id, backfill from company_memos JSON, index it.
-- ------------------------------------------------------------------
alter table companies add column if not exists app_id text;

update companies c
set app_id = coalesce(
  (
    select m.content::jsonb ->> 'id'
    from company_memos m
    where m.user_id = c.user_id
      and m.company_name = c.name
      and m.content is not null
    limit 1
  ),
  'legacy-' || c.id::text
)
where c.app_id is null;

create unique index if not exists ux_companies_user_appid
  on companies (user_id, app_id);

-- ------------------------------------------------------------------
-- 3. company_memos: add company_app_id to replace the name-based join.
-- ------------------------------------------------------------------
alter table company_memos add column if not exists company_app_id text;

update company_memos m
set company_app_id = coalesce(
  case when m.content is not null then m.content::jsonb ->> 'id' else null end,
  (
    select c.app_id
    from companies c
    where c.user_id = m.user_id
      and c.name = m.company_name
    limit 1
  )
)
where m.company_app_id is null;

create unique index if not exists ux_company_memos_user_appid
  on company_memos (user_id, company_app_id);

-- ------------------------------------------------------------------
-- 4. todos: add app_id, backfill from the task JSON, index it.
-- ------------------------------------------------------------------
alter table todos add column if not exists app_id text;

update todos t
set app_id = coalesce(
  case when t.task is not null then t.task::jsonb ->> 'id' else null end,
  'legacy-' || t.id::text
)
where t.app_id is null;

create unique index if not exists ux_todos_user_appid
  on todos (user_id, app_id);
