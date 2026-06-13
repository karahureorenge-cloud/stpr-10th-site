-- =========================================================================
-- 変更履歴テーブル change_logs
--
-- 編集・公開・下書き戻し・削除・復元のたびに 1 行記録する（管理画面の各 server
-- action から書き込む）。changed_by は管理認証が単一共有パスワードのため実ユーザー
-- 名が無く、操作系統のスコープ（"fansite" / "10th" / "cron"）を入れる。
-- diff には変更前後（update）/ 削除理由（delete）等を jsonb で保存。
--
-- RLS 有効。公開ポリシーは作らない（service-role 経由の管理画面のみ読み書き）。
-- Supabase の SQL Editor に貼り付けて実行する。
-- =========================================================================

create table if not exists public.change_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id  text not null,
  changed_by text,
  changed_at timestamptz not null default now(),
  action text not null check (action in
    ('create','update','publish','unpublish','delete','restore','hard_delete')),
  diff jsonb
);

create index if not exists change_logs_record_idx
  on public.change_logs (table_name, record_id, changed_at desc);

alter table public.change_logs enable row level security;
-- 公開ポリシーは付けない（anon/authenticated からは読めない）。
