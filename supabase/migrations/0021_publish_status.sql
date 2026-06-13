-- =========================================================================
-- 全テーブルに publish_status（下書き/公開）を追加して公開フラグを統一
--
-- 既存の公開判定は news.status='published' と各テーブルの is_active に
-- 散らばっていた。これを publish_status(draft/published) に一本化する。
-- 既存の別用途 status（lives=coming/ongoing/finished, magazines=released/upcoming）
-- はそのまま温存する（別カラム）。
--
-- 既存行は「現在公開中のものが消えない」ようシードする:
--   - is_active を持つ表（lives/goods/events/songs/albums）: is_active=false → draft、他 published
--   - news: status='published' → published、他 draft
--   - 残り: published
-- ⚠️ goods/events/songs/albums で is_active=false の行は今後公開サイトから外れる
--    （従来 repo は is_active を見ていなかった）。公開ワークフロー統一の意図どおり。
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
    execute format(
      'alter table public.%I add column if not exists publish_status text not null default ''draft'' check (publish_status in (''draft'',''published''))',
      t
    );
    execute format(
      'create index if not exists %I on public.%I (publish_status)',
      t || '_publish_status_idx', t
    );
  end loop;
end $$;

-- 既存行のシード（公開中を維持）
update public.lives  set publish_status = case when is_active is false then 'draft' else 'published' end;
update public.goods  set publish_status = case when is_active is false then 'draft' else 'published' end;
update public.events set publish_status = case when is_active is false then 'draft' else 'published' end;
update public.songs  set publish_status = case when is_active is false then 'draft' else 'published' end;
update public.albums set publish_status = case when is_active is false then 'draft' else 'published' end;

update public.news set publish_status = case when status = 'published' then 'published' else 'draft' end;

update public.schedules set publish_status = 'published';
update public.magazines set publish_status = 'published';
update public.visuals   set publish_status = 'published';
update public.media     set publish_status = 'published';
update public.projects  set publish_status = 'published';
update public.movies    set publish_status = 'published';
update public.streams   set publish_status = 'published';
