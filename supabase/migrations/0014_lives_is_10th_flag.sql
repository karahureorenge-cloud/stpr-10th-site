-- lives.is_10th で 10周年サイトと非公式ファンサイトの表示を出し分ける。
-- is_10th は 0001_init.sql で `boolean not null default false` 済み。
--
-- 既存の10周年アリーナツアーを is_10th=true に更新する。
-- microCMS から取込んだ既存データは default(false) のまま据え置く。
update public.lives
set is_10th = true
where slug = 'stpr10thAnniversary_arena_tour';
