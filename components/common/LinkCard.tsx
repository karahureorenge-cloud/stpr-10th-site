import Link from "next/link"
import { formatDateDot, accentColorFromSeed, resolveYoutubeThumbnail } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import "@/components/group/strawberry-prince/strawberry-prince.css"

/**
 * 汎用カード（PROJECT / MOVIE / STREAM 用）。
 * EventCard と同じ sp-sticker クラスでシール風の傾きを実現する。
 * - 傾きは sp-sticker の nth-child（even=+1.2deg / 3n=-0.6deg / その他=-1.2deg）で決まり、
 *   ホバーで rotate(0) + 浮き上がりに戻る。CSS 変数 --tilt や card-tilt は使わない。
 * - sp-sticker は .theme-strawberry 配下でのみ効くため、グリッド側に theme-strawberry が必要。
 * - 内部リンク（external=false）は <Link>、外部リンク（external=true）は別タブの <a>。
 * - 左アクセント線の色は seed（slug / id、無ければ title）から決定的に決まる。
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
  // slug が無いカードは title をシードにして決定的なアクセント色を得る。
  const colorSeed = seed || title
  // thumbnail 未設定でも href が YouTube URL なら hqdefault を自動取得。
  const thumb = thumbnail || resolveYoutubeThumbnail(undefined, href)
  // EventCard（グリッド表示）と完全に同一のクラス。
  // sp-card が背景(rgba(255,247,250,0.55))・blur(20px)・枠線・角丸28px・影・
  // ホバー挙動を、sp-sticker がシール風の傾きを、sp-shimmer-on-hover が
  // ホバー時のシマーを担う。背景/枠線/影/角丸は CSS 側で定義されるため
  // Tailwind では指定しない。
  const className = "sp-card sp-shimmer-on-hover sp-sticker relative block group p-3"

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
          background: accentColorFromSeed(colorSeed),
          borderRadius: 2,
        }}
      />
      <div className="relative aspect-video overflow-hidden rounded-xl bg-white/40">
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
    return <div className={className}>{inner}</div>
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  )
}
