-- =========================================================================
-- すとぷり 10th Anniversary — projects / movies / streams テーブルを追加
--
-- PROJECT … 企画（詳細ページ + 複数画像ギャラリーあり・slug 管理）
-- MOVIE   … 動画（カードクリックで外部URLへ）
-- STREAM  … 配信（カードクリックで外部URLへ）
--
-- 方針: RLS 有効化 + 公開読み取り（anon/authenticated は SELECT のみ）。
-- Supabase の SQL Editor に貼り付けて実行する。
-- =========================================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  url text,
  publish_date date,
  thumbnail text,
  description text,
  category text,
  images text[] not null default '{}',
  period_start date,
  period_end date,
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  publish_date date,
  thumbnail text,
  description text,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.streams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  publish_date date,
  thumbnail text,
  description text,
  category text,
  created_at timestamptz not null default now()
);

-- RLS 有効化 + 公開読み取り
alter table public.projects enable row level security;
alter table public.movies enable row level security;
alter table public.streams enable row level security;

drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects
  for select to anon, authenticated using (true);

drop policy if exists "movies public read" on public.movies;
create policy "movies public read" on public.movies
  for select to anon, authenticated using (true);

drop policy if exists "streams public read" on public.streams;
create policy "streams public read" on public.streams
  for select to anon, authenticated using (true);
