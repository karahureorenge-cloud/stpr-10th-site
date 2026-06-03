import Link from "next/link"
import type { CSSProperties } from "react"
import type { Song } from "@/data/songs"
import { resolveYoutubeThumbnail, formatDateDot, accentColorFromSeed, rotationFromSeed } from "@/lib/utils"
import type { ViewMode } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import TypeBadge from "@/components/common/TypeBadge"

const BASE = "/stpr-10th-anniversary"

/** 楽曲一覧のカード（グリッド / リスト 両対応）。グリッドは白背景・ピンク枠・影のフラットカード。 */
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

  // グリッド: 白背景・ピンク枠・影・角丸のフラットカード。
  return (
    <Link
      href={href}
      className="card-tilt group relative block overflow-hidden rounded-2xl border border-pink-200 bg-white p-3 shadow-md hover:shadow-lg"
      style={{ "--tilt": `${rotationFromSeed(song.slug)}deg` } as CSSProperties}
    >
      {/* 左側の縦線（slug をシードにカラーパレットから決定的に選択） */}
      <span
        aria-hidden
        className="absolute"
        style={{
          left: 4,
          top: "18%",
          bottom: "18%",
          width: 3,
          background: accentColorFromSeed(song.slug),
          borderRadius: 2,
        }}
      />
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-50">
        <SafeImage
          src={thumb}
          alt={song.title}
          fill
          fallbackLabel="MUSIC"
          className="object-cover"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        <span className="absolute right-2 top-2 z-10">
          <TypeBadge label={song.type} tone="rose" size="sm" />
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-bold text-[#3a2540]">{song.title}</p>
      {song.publishedDate && (
        <p className="mt-1.5 text-xs font-semibold text-[#9a8aa0]">
          {formatDateDot(song.publishedDate)}
        </p>
      )}
    </Link>
  )
}
