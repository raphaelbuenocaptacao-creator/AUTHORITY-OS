-- Authority OS — production schema blueprint
-- Apply through a reviewed Neon migration before production use.

create extension if not exists pgcrypto;

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  display_name text not null,
  profession text,
  city text,
  audience text,
  offer text,
  objective text,
  tone text,
  instagram_handle text,
  website_url text,
  authority_score integer not null default 0 check (authority_score between 0 and 100),
  memory jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  brand_profile_id uuid references brand_profiles(id) on delete cascade,
  platform text,
  format text,
  title text not null,
  hook text,
  body text,
  cta text,
  objective text,
  status text not null default 'draft',
  scheduled_for timestamptz,
  published_at timestamptz,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source text,
  name text,
  handle text,
  phone text,
  email text,
  stage text not null default 'new',
  notes text,
  estimated_value numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  action text not null,
  status text not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  platform text not null,
  captured_on date not null,
  followers integer,
  reach integer,
  profile_visits integer,
  conversations integer,
  opportunities integer,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(workspace_id, platform, captured_on)
);

create index if not exists content_items_workspace_status_idx on content_items(workspace_id, status, created_at desc);
create index if not exists leads_workspace_stage_idx on leads(workspace_id, stage, created_at desc);
create index if not exists metric_snapshots_workspace_date_idx on metric_snapshots(workspace_id, captured_on desc);
