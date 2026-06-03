import Link from "next/link"
import type { CSSProperties } from "react"
import type { Event } from "@/data/events"
import { formatDateDot } from "@/lib/utils"
import "@/components/group/strawberry-prince/strawberry-prince.css"

const BASE = "/stpr-10th-anniversary"

/* メンバーカラーを 6 色巡回（LIVE と被らないよう +3 オフセットで使う） */
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
 * イベントカード（既存ファンサイト すとぷりグループページから完全移植）。
 * sp-card / sp-sticker / sp-stamp / sp-holo-badge をそのまま使用。
 * データソースのみ Supabase（10th 型）に差し替え（keyVisual は文字列URL）。
 */
export default function EventCard({
  event,
  index = 0,
}: {
  event: Event
  index?: number
}) {
  const idx = index
  const eventType = event.eventType
  const memberRgb = MEMBER_RGB_CYCLE[(idx + 3) % MEMBER_RGB_CYCLE.length]
  const dateRange = `${formatDateDot(event.periodStart)}${
    event.periodEnd && event.periodEnd !== event.periodStart
      ? ` 〜 ${formatDateDot(event.periodEnd)}`
      : ""
  }`

  return (
    <Link
      href={`${BASE}/event/${event.slug}`}
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
      {idx === 0 && (
        <span className="sp-stamp absolute z-10" style={{ top: 10, left: 10 }}>
          NEW
        </span>
      )}
      {event.isOngoing && idx !== 0 && (
        <span className="sp-stamp absolute z-10" style={{ top: 10, left: 10 }}>
          ONGOING
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
      <div className="aspect-video rounded-xl overflow-hidden bg-white/40">
        {event.keyVisual && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.keyVisual}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        )}
      </div>
      <p
        className="mt-3 text-sm font-bold truncate"
        style={{ color: "var(--sp-text)" }}
      >
        {event.title}
      </p>
      <p className="mt-1.5" style={DATE_STYLE}>
        {dateRange}
      </p>
      {eventType && (
        <p
          className="mt-0.5"
          style={{
            fontSize: 10,
            color: "var(--sp-text-soft, #b88aa6)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {eventType}
        </p>
      )}
    </Link>
  )
}
