import Link from "next/link"
import type { CSSProperties } from "react"
import type { Album } from "@/data/albums"
import { formatDateDot, accentColorFromSeed } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import "@/components/group/strawberry-prince/strawberry-prince.css"

const BASE = "/stpr-10th-anniversary"

const DATE_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--sp-text-accent)",
  letterSpacing: "0.02em",
  fontVariantNumeric: "tabular-nums",
}

/** アルバム一覧のカード。EventCard・SongCard と同じ sp-card スタイル（角丸・ピンク枠・影・ホバー）。
 *  theme-strawberry 配下が必要。 */
export default function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="theme-strawberry">
      <Link
        href={`${BASE}/album/${album.slug}`}
        className="sp-card sp-shimmer-on-hover sp-sticker relative block group p-3"
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
            background: accentColorFromSeed(album.slug),
            borderRadius: 2,
          }}
        />
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white/40">
          <SafeImage
            src={album.cover}
            alt={album.title}
            fill
            fallbackLabel="ALBUM"
            className="object-cover"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        </div>
        <p
          className="mt-3 line-clamp-2 text-sm font-bold leading-snug"
          style={{ color: "var(--sp-text)" }}
        >
          {album.title}
        </p>
        {album.releaseDate && (
          <p className="mt-1.5" style={DATE_STYLE}>
            {formatDateDot(album.releaseDate)}
          </p>
        )}
      </Link>
    </div>
  )
}
