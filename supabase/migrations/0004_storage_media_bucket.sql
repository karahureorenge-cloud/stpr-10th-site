-- =========================================================================
-- すとぷり 10th Anniversary — Storage「media」バケット（Public）
--
-- 管理画面の画像アップロード先。アップロードは Secret(service_role) キーの
-- admin クライアントが行うため RLS をバイパスする（書き込みポリシー不要）。
-- バケットを public にすることで getPublicUrl の URL が誰でも閲覧可能になる。
--
-- 実行方法（どちらかでOK）:
--   A) Supabase ダッシュボード > Storage > New bucket
--        Name: media / Public bucket: ON で作成（最も簡単）
--   B) この SQL を SQL Editor で実行
-- =========================================================================

-- バケット作成（既にあれば public フラグだけ更新）。
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- 公開読み取りポリシー（明示・冪等）。
-- ※ public バケットなら無くても公開URLは閲覧可能だが、明示しておく。
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

-- 書き込み（insert/update/delete）ポリシーは作らない。
-- → anon/publishable キーからは書き込み不可。
--    管理画面の Secret キー（service_role 相当）のみが書き込める。
