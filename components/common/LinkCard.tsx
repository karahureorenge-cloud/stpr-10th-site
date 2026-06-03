import Link from "next/link"
import type { CSSProperties } from "react"
import {
  formatDateDot,
  accentColorFromSeed,
  rotationFromSeed,
  resolveYoutubeThumbnail,
} from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"

/**
 * 汎用カード（PROJECT / MOVIE / STREAM 用）。
 * EventCard・SongCard と同じスタイル（角丸・影・ピンク枠・シール風の傾き演出）。
 * - 内部リンク（external=false）は <Link>、外部リンク（external=true）は別タブの <a>。
 * - 傾き角度・左アクセント線の色は seed（slug / id）から決定的に決まる。
 */
export default function LinkCard({
  href,
  external = false,
  seed,
  title,
  thumbnail,
  date,
  category,
  fallbackLabel = "10th",
}: {
  href?: string
  external?: boolean
  /** 傾き角度・アクセント色のシード（slug / id）。無い場合は title を使う。 */
  seed?: string
  title: string
  thumbnail?: string
  date?: string
  category?: string
  fallbackLabel?: string
}) {
  // slug が無いカードは title をシードにして決定的な傾き・色を得る。
  const tiltSeed = seed || title
  // thumbnail 未設定でも href が YouTube URL なら hqdefault を自動取得。
  const thumb = thumbnail || resolveYoutubeThumbnail(undefined, href)
  const className =
    "card-tilt group relative block overflow-hidden rounded-2xl border border-pink-200 bg-white p-3 shadow-md hover:shadow-lg"
  const style = { "--tilt": `${rotationFromSeed(tiltSeed)}deg` } as CSSProperties

  const inner = (
    <>
      {/* 左側の縦線（seed をシードにカラーパレットから決定的に選択） */}
      <span
        aria-hidden
        className="absolute"
        style={{
          left: 4,
          top: "18%",
          bottom: "18%",
          width: 3,
          background: accentColorFromSeed(tiltSeed),
          borderRadius: 2,
        }}
      />
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-50">
        <SafeImage
          src={thumb}
          alt={title}
          fill
          fallbackLabel={fallbackLabel}
          className="object-cover"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
      </div>
      <p className="mt-3 line-clamp-2 break-words text-sm font-bold leading-snug text-[#3a2540]">
        {title}
      </p>
      {date && (
        <p className="mt-1.5 text-xs font-semibold text-[#9a8aa0]">{formatDateDot(date)}</p>
      )}
      {category && (
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#b88aa6]">{category}</p>
      )}
    </>
  )

  if (!href) {
    return (
      <div className={className} style={style}>
        {inner}
      </div>
    )
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className={className} style={style}>
      {inner}
    </Link>
  )
}
