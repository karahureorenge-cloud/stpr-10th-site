-- ツアー共通の会場限定グッズ・配布物（全会場共通）。
-- リッチテキスト（HTML文字列）を格納する text 列。
alter table public.lives
  add column if not exists common_venue_limited_goods text,
  add column if not exists common_venue_limited_items text;
