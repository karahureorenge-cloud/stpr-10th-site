-- =========================================================================
-- すとぷり 10th Anniversary — スキーマ拡張（fansite 型定義へ寄せる・優先度高分）
--
-- 0001_init.sql の 5 テーブル（lives / goods / events / songs / albums）に
-- ファンサイト（microCMS）相当のフィールドを追加する。
--
-- 方針:
--   - すべて `add column if not exists` で冪等（再実行しても安全）
--   - 画像オブジェクトは text(URL)、参照は text[]（slug/id の配列）に平坦化
--   - リッチな繰り返しフィールドは jsonb 配列（default '[]'）で保持
--   - lives.ticket_url は ticket_info(jsonb) へ置き換え（複数チケット種別対応）
--
-- Supabase の SQL Editor に貼り付けて実行する。
-- =========================================================================


-- =========================================================================
-- 1. lives（ライブ）
-- =========================================================================
alter table public.lives add column if not exists live_type             text;
alter table public.lives add column if not exists hashtag               text;
alter table public.lives add column if not exists member_ids            text[] not null default '{}';
-- 複数チケット種別: [{ticketType, salePeriod, price, method, status, info, purchaseUrl}]
alter table public.lives add column if not exists ticket_info           jsonb  not null default '[]'::jsonb;
alter table public.lives add column if not exists related_lives         text[] not null default '{}';
alter table public.lives add column if not exists related_albums        text[] not null default '{}';
alter table public.lives add column if not exists related_events        text[] not null default '{}';
alter table public.lives add column if not exists official_site_url     text;
alter table public.lives add column if not exists official_playlist_url text;

-- 旧 ticket_url（単一URL）は ticket_info(jsonb) に統合するため削除。
-- 既存値を退避したい場合はこの行を実行前に手動でコピーすること。
alter table public.lives drop column if exists ticket_url;

-- venues(jsonb) は既存列を流用（schemaless）。
-- 想定構造を fansite 互換へ拡張:
--   [{ "venueName": "東京ドーム", "stageName": "", "prefecture": "東京",
--      "shows": [{ "date": "2026-06-04", "partLabel": "昼の部",
--                  "scheduleText": "開場16:00/開演17:00",
--                  "setlist": [{ "trackNumber": 1, "title": "曲名" }] }] }]
-- → 列定義の変更は不要（DDL なし）。admin の help テキストで構造を案内する。


-- =========================================================================
-- 2. goods（グッズ）
-- =========================================================================
alter table public.goods add column if not exists sale_type    text;
alter table public.goods add column if not exists sale_period  text;
-- 関連ライブ（単一・slug 参照）
alter table public.goods add column if not exists related_live text;


-- =========================================================================
-- 3. events（イベント）
-- =========================================================================
alter table public.events add column if not exists hashtag        text;
alter table public.events add column if not exists member_ids     text[] not null default '{}';
alter table public.events add column if not exists related_lives  text[] not null default '{}';
alter table public.events add column if not exists related_albums text[] not null default '{}';
-- 繰り返しセクション（fansite の各セクション配列に対応）
alter table public.events add column if not exists store_info     jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists goods_info     jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists broadcast_info jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists campaign_info  jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists media_info     jsonb not null default '[]'::jsonb;


-- =========================================================================
-- 4. songs（楽曲）
-- =========================================================================
alter table public.songs add column if not exists artist        text;
alter table public.songs add column if not exists streaming_url text;
-- フル URL（既存 youtube_id と併用。どちらか入力されていればよい）
alter table public.songs add column if not exists youtube_url   text;


-- =========================================================================
-- 5. albums（アルバム）
-- =========================================================================
alter table public.albums add column if not exists album_type    text;
alter table public.albums add column if not exists purchase_url  text;
alter table public.albums add column if not exists streaming_url text;
-- 形態（通常盤/初回盤など）: [{editionName, catalog, price, spec, cover}]
alter table public.albums add column if not exists editions      jsonb not null default '[]'::jsonb;


-- =========================================================================
-- 6. PostgREST にスキーマ変更を通知（即時リロード）
-- =========================================================================
notify pgrst, 'reload schema';
