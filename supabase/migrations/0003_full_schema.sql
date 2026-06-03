-- =========================================================================
-- すとぷり 10th Anniversary — スキーマ全面再構築（microCMS スキーマへ完全準拠）
--
-- 0001 / 0002 を前提に、5 テーブル（lives / goods / events / songs / albums）を
-- ファンサイト（microCMS）のフィールド構成へ作り直す。
--
-- 方針:
--   - すべて `add column if not exists` / `drop column if exists` で冪等
--   - microCMS で別名・別型になっているフィールドは「新カラム追加 → 旧カラム削除」で置換
--     例) image→key_visual, category→product_type, shop_url→purchase_url,
--         start_date/end_date→period_start/period_end, release_date→published_date,
--         track_slugs→tracks, member_ids→members(lives のみ)
--   - 画像は text(URL)、複数画像は text[]、参照は text[]（slug/id）、
--     繰り返しフィールドは jsonb 配列（default '[]'）
--   - 10周年サイト固有の補助列（status / is_10th / note / sort_order）は維持
--
-- Supabase の SQL Editor に貼り付けて実行する（0001→0002→0003 の順に適用）。
-- =========================================================================


-- =========================================================================
-- 1. lives（ライブ）
-- =========================================================================
-- --- 追加 ---
alter table public.lives add column if not exists hashtag               text;
-- live_type は 0002 で text 追加済み（admin 側で select 化）
alter table public.lives add column if not exists live_type             text;
alter table public.lives add column if not exists period_start          timestamptz;
alter table public.lives add column if not exists period_end            timestamptz;
alter table public.lives add column if not exists members               text[] not null default '{}';
-- チケットラインナップ: [{ticketName, price}]
alter table public.lives add column if not exists ticket_lineup         jsonb  not null default '[]'::jsonb;
-- チケット種別: [{ticketType, salePeriod, price, method, info, purchaseUrl, status}]
alter table public.lives add column if not exists ticket_info           jsonb  not null default '[]'::jsonb;
-- 複数画像URL
alter table public.lives add column if not exists fc_info               text[] not null default '{}';
alter table public.lives add column if not exists upgrade_goods_info    text[] not null default '{}';
alter table public.lives add column if not exists official_site_url     text;
alter table public.lives add column if not exists official_playlist_url text;
alter table public.lives add column if not exists official_report_url   text;
alter table public.lives add column if not exists unofficial_report_url text;
-- 物販情報: [{saleType, image, salePeriod, deliveryInfo, info, purchaseUrl}]
alter table public.lives add column if not exists goods_info            jsonb  not null default '[]'::jsonb;
-- 会場公演: [{venueName, stageName, prefecture, areaMapImage, dayOfGoods[], shows[]}]
alter table public.lives add column if not exists venues                jsonb  not null default '[]'::jsonb;
-- 配信(PPV): [{platform, viewingPeriod, price, purchaseUrl, info}]
alter table public.lives add column if not exists ppv_info              jsonb  not null default '[]'::jsonb;
-- ライブビューイング: [{title, screeningDate, price, theatersUrl, purchaseUrl, info}]
alter table public.lives add column if not exists live_viewing          jsonb  not null default '[]'::jsonb;
alter table public.lives add column if not exists related_lives         text[] not null default '{}';
alter table public.lives add column if not exists related_albums        text[] not null default '{}';
alter table public.lives add column if not exists related_events        text[] not null default '{}';
-- ライブレポート
alter table public.lives add column if not exists has_report           boolean not null default false;
alter table public.lives add column if not exists report_published_at  timestamptz;
alter table public.lives add column if not exists report_lead_title    text;
alter table public.lives add column if not exists report_content       text;
alter table public.lives add column if not exists report_thumbnail     text;
alter table public.lives add column if not exists report_gallery       text;

-- --- 置換のための旧カラム削除 ---
alter table public.lives drop column if exists start_date;
alter table public.lives drop column if exists end_date;
alter table public.lives drop column if exists date_label;
alter table public.lives drop column if exists member_ids;
alter table public.lives drop column if exists ticket_url;


-- =========================================================================
-- 2. goods（グッズ）
-- =========================================================================
-- --- 追加 ---
alter table public.goods add column if not exists product_type  text not null default '';
alter table public.goods add column if not exists key_visual    text;
alter table public.goods add column if not exists lineup_images text[] not null default '{}';
alter table public.goods add column if not exists sale_type     text;
alter table public.goods add column if not exists sale_period   text;
alter table public.goods add column if not exists delivery_info text;
alter table public.goods add column if not exists purchase_url  text;
alter table public.goods add column if not exists related_live  text;
alter table public.goods add column if not exists is_active     boolean not null default true;

-- --- 置換のための旧カラム削除 ---
alter table public.goods drop column if exists category;   -- → product_type
alter table public.goods drop column if exists image;      -- → key_visual
alter table public.goods drop column if exists shop_url;    -- → purchase_url


-- =========================================================================
-- 3. events（イベント）
-- =========================================================================
-- --- 追加 ---
alter table public.events add column if not exists is_ongoing      boolean not null default false;
alter table public.events add column if not exists key_visual      text;
alter table public.events add column if not exists hashtag         text;
alter table public.events add column if not exists period_start    text;
alter table public.events add column if not exists period_end      text;
alter table public.events add column if not exists parent_event    text;
alter table public.events add column if not exists is_active       boolean not null default true;
-- 繰り返しセクション
alter table public.events add column if not exists store_info      jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists menu_info       jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists goods_info      jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists broadcast_info  jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists post_schedule   jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists campaign_info   jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists media_info      jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists episodes        jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists tournament_info jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists custom_section  jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists related_lives   text[] not null default '{}';
alter table public.events add column if not exists related_albums  text[] not null default '{}';
alter table public.events add column if not exists related_songs   text[] not null default '{}';

-- --- 置換のための旧カラム削除 ---
alter table public.events drop column if exists start_date;
alter table public.events drop column if exists end_date;
alter table public.events drop column if exists date_label;
alter table public.events drop column if exists location;
alter table public.events drop column if exists image;       -- → key_visual


-- =========================================================================
-- 4. songs（楽曲）
-- =========================================================================
-- type の CHECK 制約（original/cover）を外して ORIGINAL/COVER/歌ってみた を許可
alter table public.songs drop constraint if exists songs_type_check;
alter table public.songs alter column type set default 'ORIGINAL';

-- --- 追加 ---
alter table public.songs add column if not exists artist         text;
alter table public.songs add column if not exists published_date text;
alter table public.songs add column if not exists duration       text;
alter table public.songs add column if not exists genre          text;
alter table public.songs add column if not exists youtube_url    text;
alter table public.songs add column if not exists lyrics         text;
alter table public.songs add column if not exists credit         text;
alter table public.songs add column if not exists streaming_url  text;
alter table public.songs add column if not exists is_active      boolean not null default true;

-- --- 置換のための旧カラム削除 ---
alter table public.songs drop column if exists release_date;     -- → published_date


-- =========================================================================
-- 5. albums（アルバム）
-- =========================================================================
-- --- 追加 ---
alter table public.albums add column if not exists artist         text;
alter table public.albums add column if not exists album_type     text;
alter table public.albums add column if not exists total_duration text;
alter table public.albums add column if not exists label          text;
alter table public.albums add column if not exists purchase_url   text;
alter table public.albums add column if not exists streaming_url  text;
alter table public.albums add column if not exists xfd_url        text;
alter table public.albums add column if not exists summary_image  text;
-- 形態・盤違い: [{editionName, catalog, price, spec, cover}]
alter table public.albums add column if not exists editions       jsonb not null default '[]'::jsonb;
-- 特典: [{store, bonusName, bonusImage}]
alter table public.albums add column if not exists bonuses        jsonb not null default '[]'::jsonb;
-- 収録曲: [{trackNumber, songSlug}]
alter table public.albums add column if not exists tracks         jsonb not null default '[]'::jsonb;
alter table public.albums add column if not exists is_active      boolean not null default true;

-- --- 置換のための旧カラム削除 ---
alter table public.albums drop column if exists track_slugs;      -- → tracks


-- =========================================================================
-- 6. PostgREST にスキーマ変更を通知（即時リロード）
-- =========================================================================
notify pgrst, 'reload schema';
