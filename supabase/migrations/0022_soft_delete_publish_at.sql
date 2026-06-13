-- =========================================================================
-- 全テーブルに deleted_at（ゴミ箱/ソフト削除）と publish_at（予約公開）を追加
--
-- deleted_at … null=有効 / 日時=ゴミ箱行き（物理削除しない）。
--              公開サイト・管理一覧は deleted_at is null のみ表示。
-- publish_at … 予約公開日時。Cron が publish_at<=now() の draft を published 化する。
--
-- Supabase の SQL Editor に貼り付けて実行する。
-- =========================================================================

do $$
declare
  t text;
  tables text[] := array[
    'news','schedules','lives','goods','events','songs','albums',
    'magazines','visuals','media','projects','movies','streams'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I add column if not exists deleted_at timestamptz', t);
    execute format('alter table public.%I add column if not exists publish_at  timestamptz', t);
    execute format(
      'create index if not exists %I on public.%I (deleted_at) where deleted_at is null',
      t || '_deleted_at_idx', t
    );
    execute format(
      'create index if not exists %I on public.%I (publish_at)',
      t || '_publish_at_idx', t
    );
  end loop;
end $$;
