import HeroSection from "@/components/home/HeroSection"
import CategoryGrid from "@/components/home/CategoryGrid"
import Section from "@/components/common/Section"
import SectionHeading from "@/components/common/SectionHeading"
import MemberCard from "@/components/members/MemberCard"
import LiveCard from "@/components/live/LiveCard"
import EventCard from "@/components/event/EventCard"
import GoodsCard from "@/components/goods/GoodsCard"
import MusicListView from "@/components/music/MusicListView"
import AlbumListView from "@/components/album/AlbumListView"
import MagazineListView from "@/components/magazine/MagazineListView"
import MediaListView from "@/components/media/MediaListView"
import LinkCard from "@/components/common/LinkCard"
import EmptyState from "@/components/common/EmptyState"
import MoreLink from "@/components/common/MoreLink"
import { MEMBERS } from "@/data/members"
import {
  getLives,
  getEvents,
  getGoods,
  getSongs,
  getAlbums,
  getMagazines,
  getMedia,
  getProjects,
  getMovies,
  getStreams,
} from "@/lib/repo"
import { T } from "@/lib/theme"

const BASE = "/stpr-10th-anniversary"

// 管理画面の編集が即時反映されるよう常に動的レンダリング。
export const dynamic = "force-dynamic"

// 日付文字列の降順比較（新しい順）。空は末尾。
function byDateDesc(a?: string, b?: string): number {
  return (b ?? "").localeCompare(a ?? "")
}

/**
 * 10周年特設サイト TOP（完全版）。
 * HERO → 期間/キャッチ → カテゴリグリッド → 全カテゴリの全件表示。
 * 各 ListView は showControls={false} で UI を隠し、グリッド表示で全件を見せる。
 * 0 件のカテゴリは各 ListView 内部で EmptyState を表示する。
 */
export default async function TopPage() {
  // 全カテゴリのデータを並行取得。
  const [lives, events, goods, songs, albums, magazines, media, projects, movies, streams] =
    await Promise.all([
      getLives(),
      getEvents(),
      getGoods(),
      getSongs(),
      getAlbums(),
      getMagazines(),
      getMedia(),
      getProjects(),
      getMovies(),
      getStreams(),
    ])

  // TOP は各カテゴリの最新数件だけを見せ、残りは「もっと見る」で全件ページへ。
  const latestLives = [...lives].sort((a, b) => byDateDesc(a.periodStart, b.periodStart)).slice(0, 1)
  const latestEvents = [...events].sort((a, b) => byDateDesc(a.periodStart, b.periodStart)).slice(0, 3)
  const latestGoods = [...goods].sort((a, b) => byDateDesc(a.releaseDate, b.releaseDate)).slice(0, 1)
  // PROJECT / MOVIE / STREAM は取得時点で公開日の新しい順。最新3件のみ表示。
  const latestProjects = projects.slice(0, 3)
  const latestMovies = movies.slice(0, 3)
  const latestStreams = streams.slice(0, 3)

  // データ0件のカテゴリはグリッドからも外す（MUSIC / ALBUM）。
  const omitCategories = [
    ...(songs.length === 0 ? ["music"] : []),
    ...(albums.length === 0 ? ["album"] : []),
  ]

  return (
    <div>
      {/* 1. HERO */}
      <HeroSection />

      {/* 2. 期間・キャッチコピー（画像下の帯） */}
      <section
        style={{
          textAlign: "center",
          padding: "20px 16px",
          background: T.pearl,
          borderTop: "1px solid rgba(212,168,83,0.15)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "13px",
            letterSpacing: "0.3em",
            color: T.goldD,
          }}
        >
          2026.6.4 — 2027.6.3
        </p>
        <p
          style={{
            fontFamily: "var(--font-noto-serif-jp), serif",
            fontSize: "15px",
            color: T.muted,
            marginTop: "8px",
          }}
        >
          10年間の軌跡を、ここに。
        </p>
      </section>

      {/* 3. カテゴリーグリッド（同一ページ内アンカーへ） */}
      <section style={{ padding: "24px 16px" }}>
        <CategoryGrid omit={omitCategories} />
      </section>

      {/* 4. MEMBERS */}
      <Section id="members" subtitle="MEMBERS" title="メンバー" tone="white">
        <div
          className="theme-strawberry mx-auto grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-4"
          style={{ maxWidth: "960px" }}
        >
          {MEMBERS.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      </Section>

      {/* 5. LIVE / GOODS（PC は横並び・SP は縦並び。各々独立した見出し） */}
      <section className="px-4 py-8 sm:px-5 sm:py-10" style={{ background: T.pearl }}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-2">
          {/* LIVE（最新1件 + もっと見る） */}
          <div id="live" className="md:scroll-mt-[72px]">
            <SectionHeading subtitle="LIVE" title="ライブ" className="mb-5 sm:mb-8" />
            {lives.length === 0 ? (
              <EmptyState label="ライブ情報を準備中です" />
            ) : (
              <div className="theme-strawberry">
                {latestLives.map((l, i) => (
                  <LiveCard key={l.slug} live={l} index={i} />
                ))}
                {lives.length > latestLives.length && <MoreLink href={`${BASE}/live`} />}
              </div>
            )}
          </div>

          {/* GOODS（最新1件 + もっと見る） */}
          <div id="goods" className="md:scroll-mt-[72px]">
            <SectionHeading subtitle="GOODS" title="グッズ" className="mb-5 sm:mb-8" />
            {goods.length === 0 ? (
              <EmptyState label="グッズ情報を準備中です" />
            ) : (
              <div className="theme-strawberry">
                {latestGoods.map((g, i) => (
                  <GoodsCard key={g.slug} goods={g} index={i} />
                ))}
                {goods.length > latestGoods.length && <MoreLink href={`${BASE}/goods`} />}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. EVENT（種別で分けず最新3件をまとめて表示 + もっと見る） */}
      <Section id="event" subtitle="EVENT" title="イベント" tone="white">
        {events.length === 0 ? (
          <EmptyState label="イベント情報を準備中です" />
        ) : (
          <div className="theme-strawberry">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {latestEvents.map((e, i) => (
                <EventCard key={e.slug} event={e} index={i} />
              ))}
            </div>
            {events.length > latestEvents.length && <MoreLink href={`${BASE}/event`} />}
          </div>
        )}
      </Section>

      {/* 8. MUSIC（データがある場合のみ表示） */}
      {songs.length > 0 && (
        <Section id="music" subtitle="MUSIC" title="ミュージック" tone="white">
          <MusicListView songs={songs} showControls={false} />
        </Section>
      )}

      {/* 9. ALBUM（データがある場合のみ表示） */}
      {albums.length > 0 && (
        <Section id="album" subtitle="ALBUM" title="アルバム" tone="pearl">
          <AlbumListView albums={albums} showControls={false} />
        </Section>
      )}

      {/* 10. MAGAZINE */}
      <Section id="magazine" subtitle="MAGAZINE" title="雑誌" tone="white">
        <MagazineListView magazines={magazines} />
      </Section>

      {/* 11. MEDIA（最新5件 + もっと見る） */}
      <Section id="media" subtitle="MEDIA" title="メディア" tone="pearl">
        <MediaListView media={media.slice(0, 5)} showControls={false} />
        {media.length > 5 && <MoreLink href={`${BASE}/media`} />}
      </Section>

      {/* 12. PROJECT（最新3件 + もっと見る・0件なら非表示） */}
      {projects.length > 0 && (
        <Section id="project" subtitle="PROJECT" title="企画" tone="white">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestProjects.map((p) => (
              <LinkCard
                key={p.slug}
                href={`${BASE}/project/${p.slug}`}
                seed={p.slug}
                title={p.title}
                thumbnail={p.thumbnail}
                date={p.publishDate}
                category={p.category}
                fallbackLabel="PROJECT"
              />
            ))}
          </div>
          {projects.length > latestProjects.length && <MoreLink href={`${BASE}/project`} />}
        </Section>
      )}

      {/* 13. MOVIE（最新3件 + もっと見る・0件なら非表示） */}
      {movies.length > 0 && (
        <Section id="movie" subtitle="MOVIE" title="動画" tone="pearl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestMovies.map((m) => (
              <LinkCard
                key={m.id}
                href={m.url}
                external
                seed={m.id}
                title={m.title}
                thumbnail={m.thumbnail}
                date={m.publishDate}
                category={m.category}
                fallbackLabel="MOVIE"
              />
            ))}
          </div>
          {movies.length > latestMovies.length && <MoreLink href={`${BASE}/movie`} />}
        </Section>
      )}

      {/* 14. STREAM（最新3件 + もっと見る・0件なら非表示） */}
      {streams.length > 0 && (
        <Section id="stream" subtitle="STREAM" title="配信" tone="white">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestStreams.map((s) => (
              <LinkCard
                key={s.id}
                href={s.url}
                external
                seed={s.id}
                title={s.title}
                thumbnail={s.thumbnail}
                date={s.publishDate}
                category={s.category}
                fallbackLabel="STREAM"
              />
            ))}
          </div>
          {streams.length > latestStreams.length && <MoreLink href={`${BASE}/stream`} />}
        </Section>
      )}
    </div>
  )
}
