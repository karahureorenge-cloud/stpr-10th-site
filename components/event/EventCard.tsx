import Link from "next/link"
import type { Event } from "@/data/events"
import { getLiveStatus, formatPeriod } from "@/lib/utils"
import type { ViewMode } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import TypeBadge from "@/components/common/TypeBadge"

const BASE = "/stpr-10th-anniversary"

// イベント用の状態ラベル（既存ファンサイトの EventListView と同じ日本語表記）。
const EVENT_STATUS = {
  coming: { label: "開催予定", className: "bg-slate-500" },
  ongoing: { label: "開催中", className: "bg-green-500 animate-pulse" },
  finished: { label: "終了", className: "bg-gray-500/80" },
} as const

function EventStatusBadge({ event, size }: { event: Event; size: "sm" | "md" }) {
  // isOngoing 明示時は「開催中」、それ以外は日付から判定（解釈不能なら表示しない）。
  if (!event.isOngoing && !event.periodStart) return null
  const state = event.isOngoing
    ? "ongoing"
    : getLiveStatus(event.periodStart, event.periodEnd)
  const s = EVENT_STATUS[state]
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[10px]"
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold tracking-[0.12em] text-white ${sizeCls} ${s.className}`}
    >
      {s.label}
    </span>
  )
}

/** イベント一覧のカード（グリッド / リスト 両対応） */
export default function EventCard({
  event,
  view = "list",
}: {
  event: Event
  view?: ViewMode
}) {
  const href = `${BASE}/event/${event.slug}`

  if (view === "grid") {
    return (
      <Link
        href={href}
        className="group flex flex-col overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm transition-all hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <SafeImage
            src={event.keyVisual}
            alt={event.title}
            fill
            fallbackLabel="EVENT"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <span className="absolute left-3 top-3">
            <TypeBadge label={event.eventType} />
          </span>
          <span className="absolute right-3 top-3">
            <EventStatusBadge event={event} size="md" />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-5">
          <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug text-[#3a2540]">
            {event.title}
          </h3>
          <p className="text-sm text-[#6a5570]">
            {formatPeriod(event.periodStart, event.periodEnd)}
          </p>
          {event.description && (
            <p className="line-clamp-2 pt-1 text-xs text-[#9a8aa0]">{event.description}</p>
          )}
        </div>
      </Link>
    )
  }

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
          src={event.keyVisual}
          alt={event.title}
          fill
          fallbackLabel="EVENT"
          className="object-cover"
          sizes="160px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <TypeBadge label={event.eventType} size="sm" />
          <EventStatusBadge event={event} size="sm" />
        </div>
        <h3 className="truncate font-serif text-sm font-bold text-[#3a2540] group-hover:text-gold-700">
          {event.title}
        </h3>
        <p className="truncate text-xs text-[#9a8aa0]">
          {formatPeriod(event.periodStart, event.periodEnd)}
        </p>
      </div>
    </Link>
  )
}
