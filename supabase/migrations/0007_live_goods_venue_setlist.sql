-- =========================================================================
-- すとぷり 10th Anniversary — lives に「ライブグッズ画像 / 会場グッズ販売 /
-- セットリスト」のカラムを追加
--
-- 方針: add column if not exists で冪等。
-- Supabase の SQL Editor に貼り付けて実行する。
-- =========================================================================

-- ライブグッズ画像（複数）: 公開URLの配列
alter table public.lives add column if not exists goods_images text[] not null default '{}';

-- 会場グッズ販売情報（会場ごと）: jsonb 配列
--   { venueName, saleSchedule, ticketInfo, ticketPeriod, payment, note }
alter table public.lives add column if not exists venue_goods jsonb not null default '[]';

-- セットリスト: jsonb 配列 { trackNumber, title, memo }
alter table public.lives add column if not exists setlist jsonb not null default '[]';
