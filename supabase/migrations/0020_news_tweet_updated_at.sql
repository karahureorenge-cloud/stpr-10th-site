-- =========================================================================
-- news に tweet（拡散用ツイート文）と updated_at 列を追加
--
-- NEWS記事自動生成機能（Claude API）が tweet を保存するため。
-- グループは既存の group_slugs（text[]）をそのまま使う（自動生成は1件を配列で保存）。
-- Supabase の SQL Editor に貼り付けて実行する。
-- =========================================================================

alter table public.news add column if not exists tweet text;
alter table public.news add column if not exists updated_at timestamptz not null default now();
