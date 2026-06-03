import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { getAlbumBySlug, getSongBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"
import SectionHeading from "@/components/common/SectionHeading"

const BASE = "/stpr-10th-anniversary"

export const dynamic = "force-dynamic"

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
      trackSlug: t.songSlug ?? "",
      song: t.songSlug ? await getSongBySlug(t.songSlug) : undefined,
    })),
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        {/* カバー */}
        <div
          className="relative w-full overflow-hidden rounded-3xl border border-gold-200/70"
          style={{ aspectRatio: "1/1" }}
        >
          <SafeImage
            src={album.cover}
            alt={album.title}
            fill
            fallbackLabel="ALBUM"
            className="object-cover"
            sizes="(min-width: 768px) 280px, 100vw"
            priority
          />
        </div>

        {/* 情報 */}
        <div className="flex flex-col gap-4">
          {album.albumType && (
            <span className="w-fit rounded-full bg-gold-400/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white">
              {album.albumType}
            </span>
          )}
          <h1 className="font-serif text-2xl font-bold leading-snug text-[#3a2540]">
            {album.title}
          </h1>

          <dl className="flex flex-col gap-2 text-sm">
            {album.artist && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-gold-600">アーティスト</dt>
                <dd className="text-[#3a2540]">{album.artist}</dd>
              </div>
            )}
            {album.releaseDate && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-gold-600">発売日</dt>
                <dd className="text-[#3a2540]">{formatDate(album.releaseDate)}</dd>
              </div>
            )}
            {album.label && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-gold-600">レーベル</dt>
                <dd className="text-[#3a2540]">{album.label}</dd>
              </div>
            )}
            {album.totalDuration && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-gold-600">総再生時間</dt>
                <dd className="text-[#3a2540]">{album.totalDuration}</dd>
              </div>
            )}
          </dl>

          {album.description && (
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#6a5570]">
              {album.description}
            </p>
          )}

          {(album.purchaseUrl || album.streamingUrl || album.xfdUrl) && (
            <div className="flex flex-wrap gap-2">
              {album.purchaseUrl && (
                <a
                  href={album.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center rounded-full bg-gold-400 px-6 py-2.5 font-display text-xs tracking-[0.15em] text-white transition-colors hover:bg-gold-500"
                >
                  購入 →
                </a>
              )}
              {album.streamingUrl && (
                <a
                  href={album.streamingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center rounded-full border border-gold-300 bg-white/80 px-6 py-2.5 font-display text-xs tracking-[0.15em] text-gold-700 transition-colors hover:bg-white"
                >
                  ストリーミング →
                </a>
              )}
              {album.xfdUrl && (
                <a
                  href={album.xfdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center rounded-full border border-gold-300 bg-white/80 px-6 py-2.5 font-display text-xs tracking-[0.15em] text-gold-700 transition-colors hover:bg-white"
                >
                  試聴 →
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* トラックリスト */}
      <div className="mt-12 flex flex-col gap-5">
        <SectionHeading subtitle="TRACK LIST" title="収録曲" variant="compact" />
        <ol className="flex flex-col overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm">
          {tracks.map(({ trackSlug, song }, i) => {
            return (
              <li
                key={trackSlug}
                className="flex items-center gap-4 border-b border-gold-100/70 px-5 py-3 last:border-0"
              >
                <span className="font-display text-sm text-gold-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {song ? (
                  <Link
                    href={`${BASE}/music/${song.slug}`}
                    className="font-serif text-sm text-[#3a2540] underline-offset-2 hover:text-gold-700 hover:underline"
                  >
                    {song.title}
                  </Link>
                ) : (
                  <span className="font-serif text-sm text-[#9a8aa0]">
                    {trackSlug}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
