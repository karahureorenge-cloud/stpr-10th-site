import Link from "next/link"
import type { CSSProperties } from "react"
import type { Event } from "@/data/events"
import { formatDateDot, type ViewMode } from "@/lib/utils"
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
  view = "grid",
}: {
  event: Event
  index?: number
  view?: ViewMode
}) {
  const idx = index
  const eventType = event.eventType
  const memberRgb = MEMBER_RGB_CYCLE[(idx + 3) % MEMBER_RGB_CYCLE.length]
  const dateRange = `${formatDateDot(event.periodStart)}${
    event.periodEnd && event.periodEnd !== event.periodStart
      ? ` 〜 ${formatDateDot(event.periodEnd)}`
      : ""
  }`

  // リスト表示: 画像小さめ（左）+ テキスト（右）の横長 1 行レイアウト。
  if (view === "list") {
    return (
      <Link
        href={`${BASE}/event/${event.slug}`}
        className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 p-3 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"
      >
        <div
          className="relative w-28 shrink-0 overflow-hidden rounded-xl bg-white/40 sm:w-40"
          style={{ aspectRatio: "16/9" }}
        >
          {event.keyVisual && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.keyVisual} alt={event.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold" style={{ color: "var(--sp-text)" }}>
            {event.title}
          </h3>
          {event.collabPartner && (
            <p className="truncate text-xs font-bold" style={{ color: "var(--sp-text-accent)" }}>
              ✕ {event.collabPartner}
            </p>
          )}
          <p className="mt-0.5" style={DATE_STYLE}>
            {dateRange}
          </p>
          {eventType && (
            <p className="text-[10px] uppercase tracking-wider text-[#9a8aa0]">{eventType}</p>
          )}
        </div>
      </Link>
    )
  }

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
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <p
        className="mt-3 text-sm font-bold truncate"
        style={{ color: "var(--sp-text)" }}
      >
        {event.title}
      </p>
      {event.collabPartner && (
        <p
          className="mt-1 inline-block max-w-full truncate rounded-md px-2 py-0.5 text-xs font-bold"
          style={{
            background: "rgba(245, 134, 164, 0.16)",
            color: "var(--sp-text-accent)",
          }}
        >
          ✕ {event.collabPartner}
        </p>
      )}
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
