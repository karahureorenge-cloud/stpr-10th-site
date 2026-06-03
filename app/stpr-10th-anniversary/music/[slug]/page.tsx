import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { extractYoutubeId, getYoutubeThumbnail } from "@/lib/utils"
import { getSongBySlug, getAlbumBySlug } from "@/lib/repo"

const BASE = "/stpr-10th-anniversary"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const song = await getSongBySlug(slug)
  if (!song) return { title: "楽曲が見つかりません" }
  const description =
    song.description?.slice(0, 100) ||
    [song.artist, song.type].filter(Boolean).join(" / ") ||
    `${song.title}の楽曲情報`
  const ytId = song.youtubeId || extractYoutubeId(song.youtubeUrl)
  const images = ytId ? [getYoutubeThumbnail(ytId)] : []
  return {
    title: song.title,
    description,
    openGraph: { title: song.title, description, images },
    twitter: { card: "summary_large_image", title: song.title, description, images },
  }
}

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const song = await getSongBySlug(slug)
  if (!song) notFound()

  const album = song.albumSlug ? await getAlbumBySlug(song.albumSlug) : undefined
  const youtubeId = song.youtubeId || extractYoutubeId(song.youtubeUrl)
  const thumbnailUrl = youtubeId ? getYoutubeThumbnail(youtubeId) : undefined

  const infoRows = [
    { label: "アーティスト", value: song.artist },
    { label: "公開日", value: song.publishedDate },
    { label: "再生時間", value: song.duration },
    { label: "ジャンル", value: song.genre },
  ].filter((r) => r.value)

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      {/* パンくず */}
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#9a8aa0]">
        <Link href={`${BASE}/music`} className="transition-colors hover:text-gold-600">
          MUSIC
        </Link>
        <span className="text-gold-200">›</span>
        <span className="font-medium text-[#3a2540]">{song.title}</span>
      </nav>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* サムネイル / YouTube 埋め込み */}
        <div className="overflow-hidden rounded-2xl border border-gold-200/70">
          {youtubeId ? (
            <div className="relative aspect-video w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={song.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt={song.title} className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-gold-50 text-sm text-[#9a8aa0]">
              サムネイルなし
            </div>
          )}
        </div>

        {/* 情報：タイプ・タイトル・各種メタ・配信/YouTube リンク */}
        <div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-bold ${
              song.type === "ORIGINAL"
                ? "bg-gold-100 text-gold-700"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {song.type}
          </span>
          <h1 className="mb-4 mt-2 font-serif text-3xl font-bold text-[#3a2540]">{song.title}</h1>

          <div className="mb-6 space-y-2">
            {infoRows.map((r) => (
              <div key={r.label} className="flex gap-4">
                <span className="w-24 shrink-0 text-xs text-[#9a8aa0]">{r.label}</span>
                <span className="text-sm text-[#3a2540]">{r.value}</span>
              </div>
            ))}
            {album && (
              <div className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-xs text-[#9a8aa0]">収録アルバム</span>
                <Link
                  href={`${BASE}/album/${album.slug}`}
                  className="group flex items-center gap-2 text-sm text-gold-700 hover:underline"
                >
                  <span>{album.title}</span>
                  <span className="text-xs text-[#9a8aa0] group-hover:text-gold-700">→</span>
                </Link>
              </div>
            )}
          </div>

          {song.streamingUrl && (
            <a
              href={song.streamingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 block w-full rounded-xl bg-gold-400 py-3 text-center text-sm text-white transition-colors hover:bg-gold-500"
            >
              配信サイトで聴く
            </a>
          )}
          {song.youtubeUrl && (
            <a
              href={song.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-red-500 py-3 text-center text-sm text-white transition-colors hover:bg-red-600"
            >
              YouTubeで見る
            </a>
          )}
        </div>
      </div>

      {/* クレジット・歌詞 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {song.credit && (
          <div className="rounded-2xl border border-gold-200/70 bg-white/55 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 font-serif font-bold text-[#3a2540]">クレジット</h2>
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-[#6a5570]">
              {song.credit}
            </pre>
          </div>
        )}
        {song.lyrics && (
          <div className="rounded-2xl border border-gold-200/70 bg-white/55 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 font-serif font-bold text-[#3a2540]">歌詞</h2>
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-[#6a5570]">
              {song.lyrics}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
