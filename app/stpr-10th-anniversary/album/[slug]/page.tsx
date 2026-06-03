import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDateDot, extractYoutubeId, getYoutubeThumbnail } from "@/lib/utils"
import { getAlbumBySlug, getSongBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"

const BASE = "/stpr-10th-anniversary"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const album = await getAlbumBySlug(slug)
  if (!album) return { title: "アルバムが見つかりません" }
  const description =
    album.description?.slice(0, 100) ||
    [album.artist, album.albumType].filter(Boolean).join(" / ") ||
    `${album.title}のアルバム情報`
  const images = album.cover ? [album.cover] : []
  return {
    title: album.title,
    description,
    openGraph: { title: album.title, description, images },
    twitter: { card: "summary_large_image", title: album.title, description, images },
  }
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const album = await getAlbumBySlug(slug)
  if (!album) notFound()

  // 収録曲を songSlug から解決（trackNumber 順）。
  const orderedTracks = [...(album.tracks ?? [])].sort(
    (a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0),
  )
  const tracks = await Promise.all(
    orderedTracks.map(async (t) => ({
      trackNumber: t.trackNumber,
      songSlug: t.songSlug ?? "",
      song: t.songSlug ? await getSongBySlug(t.songSlug) : undefined,
    })),
  )

  const xfdYoutubeId = extractYoutubeId(album.xfdUrl)

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* パンくず */}
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#9a8aa0]">
        <Link href={`${BASE}/album`} className="transition-colors hover:text-gold-600">
          ALBUM
        </Link>
        <span className="text-gold-200">›</span>
        <span className="font-medium text-[#3a2540]">{album.title}</span>
      </nav>

      {/* HERO：カバー・タイトル・発売日 等 */}
      <div className="mb-6 flex flex-col gap-6 rounded-2xl border border-gold-200/70 bg-white/55 p-6 backdrop-blur-sm md:flex-row">
        <div className="relative mx-auto aspect-square w-48 shrink-0 overflow-hidden rounded-xl md:mx-0">
          <SafeImage
            src={album.cover}
            alt={album.title}
            fill
            fallbackLabel="ALBUM"
            className="object-cover"
            sizes="192px"
            priority
          />
        </div>
        <div className="flex-1">
          {album.albumType && (
            <span className="mb-2 inline-block rounded-full bg-gold-400/95 px-3 py-1 text-xs font-bold text-white">
              {album.albumType}
            </span>
          )}
          <h1 className="mb-1 mt-2 font-serif text-3xl font-bold text-[#3a2540]">{album.title}</h1>
          {album.artist && <p className="mb-3 text-gold-700">{album.artist}</p>}
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-[#6a5570]">
            {album.releaseDate && <span>{formatDateDot(album.releaseDate)}</span>}
            {album.totalDuration && <span>{album.totalDuration}</span>}
            {album.label && <span>レーベル: {album.label}</span>}
          </div>
          {album.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#6a5570]">
              {album.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {album.purchaseUrl && (
              <a
                href={album.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-gold-400 px-4 py-2 text-xs text-white transition-colors hover:bg-gold-500"
              >
                CDを購入する
              </a>
            )}
            {album.streamingUrl && (
              <a
                href={album.streamingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gold-300 bg-white/80 px-4 py-2 text-xs text-gold-700 transition-colors hover:bg-white"
              >
                デジタルで聴く
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* 形態一覧 */}
          {album.editions && album.editions.length > 0 && (
            <div className="rounded-2xl border border-gold-200/70 bg-white/55 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="mb-4 font-serif font-bold text-[#3a2540]">
                形態一覧{" "}
                <span className="text-xs font-normal text-[#9a8aa0]">
                  全{album.editions.length}形態
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {album.editions.map((ed, i) => (
                  <div key={i} className="rounded-xl border border-gold-100/70 p-3">
                    {ed.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ed.cover}
                        alt={ed.editionName ?? ""}
                        className="mb-2 aspect-square w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="mb-2 flex aspect-square w-full items-center justify-center rounded-lg bg-gold-50 text-xs text-[#9a8aa0]">
                        画像
                      </div>
                    )}
                    <p className="mb-1 text-xs font-bold text-gold-700">{ed.editionName}</p>
                    {ed.catalog && <p className="text-xs text-[#9a8aa0]">品番：{ed.catalog}</p>}
                    {ed.price && <p className="text-xs text-[#9a8aa0]">価格：{ed.price}</p>}
                    {ed.spec && <p className="text-xs text-[#9a8aa0]">仕様：{ed.spec}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* XFD動画 */}
          {xfdYoutubeId && (
            <div className="rounded-2xl border border-gold-200/70 bg-white/55 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="mb-4 font-serif font-bold text-[#3a2540]">XFD動画（クロスフェード）</h2>
              <div className="flex flex-col gap-4 md:flex-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getYoutubeThumbnail(xfdYoutubeId)}
                  alt="XFD"
                  className="aspect-video w-full rounded-xl object-cover md:w-48"
                />
                <div>
                  <p className="mb-2 text-sm font-bold text-[#3a2540]">{album.title}【XFD】</p>
                  <a
                    href={album.xfdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-xl bg-red-500 px-4 py-2 text-xs text-white transition-colors hover:bg-red-600"
                  >
                    YouTubeで再生する
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* オリジナル特典 */}
          {(album.summaryImage || (album.bonuses && album.bonuses.length > 0)) && (
            <div className="rounded-2xl border border-gold-200/70 bg-white/55 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="mb-4 font-serif font-bold text-[#3a2540]">オリジナル特典</h2>
              {album.summaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={album.summaryImage} alt="オリジナル特典" className="w-full rounded-xl" />
              ) : (
                <div className="space-y-2">
                  {album.bonuses?.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-gold-50/60 p-2">
                      {b.bonusImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.bonusImage}
                          alt={b.bonusName ?? ""}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-gold-700">{b.store}</p>
                        <p className="text-sm text-[#3a2540]">{b.bonusName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 収録曲リスト */}
        <div className="space-y-6">
          {tracks.length > 0 && (
            <div className="rounded-2xl border border-gold-200/70 bg-white/55 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="mb-4 font-serif font-bold text-[#3a2540]">
                TRACK LIST{" "}
                <span className="text-xs font-normal text-[#9a8aa0]">{tracks.length}曲</span>
              </h2>
              <div className="space-y-1">
                {tracks.map(({ trackNumber, songSlug, song }, i) => {
                  const num = trackNumber ?? i + 1
                  const inner = (
                    <>
                      <span className="w-6 shrink-0 text-right text-xs text-[#9a8aa0]">
                        {String(num).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-sm text-[#3a2540]">
                        {song?.title ?? songSlug}
                      </span>
                    </>
                  )
                  return song ? (
                    <Link
                      key={i}
                      href={`${BASE}/music/${song.slug}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gold-50"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={i} className="flex items-center gap-3 p-2">
                      {inner}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
