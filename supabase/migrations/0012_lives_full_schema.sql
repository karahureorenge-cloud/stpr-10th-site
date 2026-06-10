-- 0012_lives_full_schema.sql
-- microCMS の lives 全フィールド取り込みに向けた「受け皿」カラムを追加する。
-- 既存データは削除しない（ADD COLUMN と、衝突する live_type のみ安全な型変換）。
-- 冪等（何度実行しても安全）。
--
-- ▼ 実行方法（手動）:
--   Supabase ダッシュボード → SQL Editor に貼り付けて Run。
--
-- ▼ 指示書スペックからの調整点（重要）:
--   * 既存スキーマ（0002/0003/0007/0011）と衝突する列は二重定義しない。
--     - hashtag / period_start / period_end / ticket_info / ticket_lineup /
--       goods_info / ppv_info / live_viewing / has_report / official_*_url は既に存在 → 追加しない。
--   * live_type は既に text で存在するため、`add column ... text[]` だと IF NOT EXISTS で
--     スキップされ text のまま残ってしまう。→ ガード付きで text → text[] に「変換」する
--     （既存の単一値は配列1要素として保持）。
--   * fc_info / upgrade_goods_info（既存 text[]）/ report_gallery（既存 text）は
--     既存の型・用途を壊さないため変換しない。取り込み側で既存型に合わせる。
--   * 新規の受け皿は別名カラム（*_url / *_slugs / venues_json / microcms_id 等）として追加する。

-- ── live_type: text → text[]（データ保持・冪等） ──────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'lives'
      and column_name = 'live_type' and data_type <> 'ARRAY'
  ) then
    alter table public.lives
      alter column live_type drop default;
    alter table public.lives
      alter column live_type type text[]
      using case
        when live_type is null or live_type = '' then '{}'::text[]
        else array[live_type]
      end;
    alter table public.lives
      alter column live_type set default '{}',
      alter column live_type set not null;
  end if;
end $$;

-- ── 新規カラム（microCMS 取り込みの受け皿） ─────────────────────────────
alter table public.lives
  -- キービジュアル（高さ・幅も保存。既存 key_visual(text) は後方互換で残す）
  add column if not exists key_visual_url    text,
  add column if not exists key_visual_height integer,
  add column if not exists key_visual_width  integer,
  -- 複数グループ・複数メンバー（既存 group_slug(0011)/members は残す）
  add column if not exists group_slugs       text[] not null default '{}',
  add column if not exists member_slugs      text[] not null default '{}',
  -- 会場情報（複雑な入れ子構造。既存 venues(jsonb) は残す）
  add column if not exists venues_json       jsonb  not null default '[]'::jsonb,
  -- 関連コンテンツ（既存 related_lives/related_albums は残す）
  add column if not exists related_live_slugs  text[] not null default '{}',
  add column if not exists related_album_slugs text[] not null default '{}',
  -- microCMS 元ID（移行時の照合用）
  add column if not exists microcms_id       text;

-- microcms_id の一意制約（NULL 複数可。冪等な unique index で付与）。
create unique index if not exists lives_microcms_id_key on public.lives (microcms_id);

-- ── インデックス ────────────────────────────────────────────────────────
create index if not exists lives_group_slugs_idx  on public.lives using gin (group_slugs);
create index if not exists lives_member_slugs_idx on public.lives using gin (member_slugs);
create index if not exists lives_live_type_idx    on public.lives using gin (live_type);
create index if not exists lives_period_start_idx on public.lives (period_start);

-- PostgREST にスキーマ再読込を通知。
notify pgrst, 'reload schema';
