-- 基本セトリ（DAY1）タブの表示名。未指定なら公開ページで "DAY1" を表示。
-- 各公演タブ（DAY2+）の表示名は show_setlists(jsonb) 内の label に入るため列追加は不要。
alter table public.lives
  add column if not exists setlist_label text;
