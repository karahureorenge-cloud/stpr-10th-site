import Link from "next/link"
import type { Song } from "@/data/songs"
import { resolveYoutubeThumbnail, formatDateDot } from "@/lib/utils"
import type { ViewMode } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import TypeBadge from "@/components/common/TypeBadge"

const BASE = "/stpr-10th-anniversary"

/** 楽曲一覧のカード（グリッド / リスト 両対応） */
export default function SongCard({
  song,
  view = "grid",
}: {
  song: Song
  view?: ViewMode
}) {
  const href = `${BASE}/music/${song.slug}`
  const thumb = resolveYoutubeThumbnail(song.youtubeId, song.youtubeUrl)

  if (view === "list") {
    return (
      <Link
        href={href}
        className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 p-3 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"
      >
        <div
          className="relative w-32 shrink-0 self-center overflow-hidden rounded-xl sm:w-40"
          style={{ aspectRatio: "16/9" }}
        >
          <SafeImage
            src={thumb}
            alt={song.title}
            fill
            fallbackLabel="MUSIC"
            className="object-cover"
            sizes="160px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1">
            <TypeBadge label={song.type} tone="rose" size="sm" />
          </div>
          <h3 className="truncate font-serif text-sm font-bold text-[#3a2540] group-hover:text-gold-700">
            {song.title}
          </h3>
          {song.publishedDate && (
            <p className="text-xs text-[#9a8aa0]">{formatDateDot(song.publishedDate)}</p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm transition-all hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <SafeImage
          src={thumb}
          alt={song.title}
          fill
          fallbackLabel="MUSIC"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        <span className="absolute right-2 top-2">
          <TypeBadge label={song.type} tone="rose" size="sm" />
        </span>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-[#3a2540]">
          {song.title}
        </h3>
        {song.publishedDate && (
          <p className="text-xs text-[#9a8aa0]">{formatDateDot(song.publishedDate)}</p>
        )}
      </div>
    </Link>
  )
}
