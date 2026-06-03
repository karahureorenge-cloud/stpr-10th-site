import Link from "next/link"
import type { CSSProperties } from "react"
import type { Live } from "@/data/lives"
import { formatDateDot } from "@/lib/utils"
import "@/components/group/strawberry-prince/strawberry-prince.css"

const BASE = "/stpr-10th-anniversary"

/* メンバーカラーを 6 色巡回（左アクセントバー用）— 既存ファンサイトから移植 */
const MEMBER_RGB_CYCLE = [
  "232, 122, 122",
  "168, 149, 204",
  "142, 200, 224",
  "232, 200, 120",
  "232, 160, 188",
  "232, 168, 136",
] as const

const DATE_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--sp-text-accent)",
  letterSpacing: "0.02em",
  fontVariantNumeric: "tabular-nums",
}

/**
 * ライブカード（既存ファンサイト すとぷりグループページから完全移植）。
 * sp-card / sp-sticker / sp-cheki-frame / sp-stamp / sp-holo-badge をそのまま使用。
 * データソースのみ Supabase（10th 型）に差し替え（keyVisual は文字列URL）。
 */
export default function LiveCard({
  live,
  index = 0,
}: {
  live: Live
  index?: number
}) {
  const idx = index
  const isLatest = idx === 0
  const useCheki = idx < 3
  const memberRgb = MEMBER_RGB_CYCLE[idx % MEMBER_RGB_CYCLE.length]
  const dateRange = `${formatDateDot(live.periodStart)}${
    live.periodEnd && live.periodEnd !== live.periodStart
      ? ` 〜 ${formatDateDot(live.periodEnd)}`
      : ""
  }`

  return (
    <Link
      href={`${BASE}/live/${live.slug}`}
      className="sp-card sp-shimmer-on-hover sp-sticker relative block group p-3"
    >
      {/* メンバーカラーの左アクセントバー */}
      <span
        aria-hidden
        className="absolute"
        style={{
          left: 4,
          top: "18%",
          bottom: "18%",
          width: 3,
          background: `rgba(${memberRgb}, 0.9)`,
          borderRadius: 2,
        }}
      />
      {isLatest && (
        <span className="sp-stamp absolute z-10" style={{ top: 10, left: 10 }}>
          LATEST
        </span>
      )}
      {idx === 1 && (
        <span className="sp-stamp absolute z-10" style={{ top: 10, left: 10 }}>
          NEW
        </span>
      )}
      {/* 上位 3 つに小ホロバッジ */}
      {idx < 3 && (
        <span
          aria-hidden
          className="sp-holo-badge"
          style={{ top: 8, right: 8, width: 18, height: 18 }}
        />
      )}
      {useCheki ? (
        <div className="sp-cheki-frame">
          <div className="aspect-video rounded overflow-hidden bg-white/40">
            {live.keyVisual && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={live.keyVisual}
                alt={live.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            )}
          </div>
          <p
            className="mt-2 text-sm font-bold truncate text-center"
            style={{ color: "var(--sp-text)" }}
          >
            {live.title}
          </p>
          <p className="text-center mt-1.5" style={DATE_STYLE}>
            {dateRange}
          </p>
        </div>
      ) : (
        <>
          <div className="aspect-video rounded-xl overflow-hidden bg-white/40">
            {live.keyVisual && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={live.keyVisual}
                alt={live.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            )}
          </div>
          <p
            className="mt-3 text-sm font-bold truncate"
            style={{ color: "var(--sp-text)" }}
          >
            {live.title}
          </p>
          <p className="mt-1.5" style={DATE_STYLE}>
            {dateRange}
          </p>
        </>
      )}
    </Link>
  )
}
