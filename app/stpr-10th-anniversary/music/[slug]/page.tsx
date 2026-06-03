import Link from "next/link"
import { notFound } from "next/navigation"
import { getMemberById, formatDate } from "@/lib/utils"
import { getSongBySlug, getAlbumBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"

const BASE = "/stpr-10th-anniversary"

export const dynamic = "force-dynamic"

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const song = await getSongBySlug(slug)
  if (!song) notFound()

  const album = song.albumSlug ? await getAlbumBySlug(song.albumSlug) : undefined
  const members = (song.memberIds ?? [])
    .map(getMemberById)
    .filter((m): m is NonNullable<typeof m> => Boolean(m))

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* YouTube 埋め込み（あれば）。無ければサムネ/プレースホルダー。 */}
      <div
        className="relative w-full overflow-hidden rounded-3xl border border-gold-200/70"
        style={{ aspectRatio: "16/9" }}
      >
        {song.youtubeId ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${song.youtubeId}`}
            title={song.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <SafeImage
            src={undefined}
            alt={song.title}
            fill
            fallbackLabel="MUSIC"
            className="object-cover"
          />
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <span className="w-fit rounded-full bg-rose-400/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white">
          {song.type === "original" ? "ORIGINAL" : "COVER"}
        </span>
        <h1 className="font-serif text-2xl font-bold leading-snug text-[#3a2540]">
          {song.title}
        </h1>

        <dl className="flex flex-col gap-2 text-sm">
          {song.releaseDate && (
            <div className="flex gap-3">
              <dt className="w-20 text-gold-600">配信日</dt>
              <dd className="text-[#3a2540]">{formatDate(song.releaseDate)}</dd>
            </div>
          )}
          {album && (
            <div className="flex gap-3">
              <dt className="w-20 text-gold-600">アルバム</dt>
              <dd>
                <Link
                  href={`${BASE}/album/${album.slug}`}
                  className="text-gold-700 underline-offset-2 hover:underline"
                >
                  {album.title}
                </Link>
              </dd>
            </div>
          )}
        </dl>

        {members.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <span
                key={m.id}
                className="rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: m.color }}
              >
                {m.name}
              </span>
            ))}
          </div>
        )}

        {song.description && (
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#6a5570]">
            {song.description}
          </p>
        )}

        {song.youtubeId && (
          <a
            href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center rounded-full border border-gold-300 bg-white/80 px-6 py-2.5 font-display text-xs tracking-[0.15em] text-gold-700 transition-colors hover:bg-white"
          >
            YouTube で見る →
          </a>
        )}
      </div>
    </div>
  )
}
