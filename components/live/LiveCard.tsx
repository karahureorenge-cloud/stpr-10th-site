import Link from "next/link"
import type { Live } from "@/data/lives"
import { getLiveStatus, venuesSummary, formatPeriod } from "@/lib/utils"
import type { ViewMode } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import StatusBadge from "@/components/common/StatusBadge"
import TypeBadge from "@/components/common/TypeBadge"

const BASE = "/stpr-10th-anniversary"

function resolveStatus(live: Live) {
  return live.periodStart
    ? getLiveStatus(live.periodStart, live.periodEnd)
    : live.status
}

function venuesLabel(live: Live) {
  return venuesSummary(live.venues)
}

/** ライブ一覧のカード（グリッド / リスト 両対応） */
export default function LiveCard({
  live,
  view = "grid",
}: {
  live: Live
  view?: ViewMode
}) {
  const status = resolveStatus(live)
  const href = `${BASE}/live/${live.slug}`

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
            src={live.keyVisual}
            alt={live.title}
            fill
            fallbackLabel="LIVE"
            className="object-cover"
            sizes="160px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {live.liveType && <TypeBadge label={live.liveType} size="sm" />}
            {live.is10th && <TypeBadge label="10TH" tone="rose" size="sm" />}
            <StatusBadge status={status} size="sm" />
          </div>
          <h3 className="truncate font-serif text-sm font-bold text-[#3a2540] group-hover:text-gold-700">
            {live.title}
          </h3>
          <p className="truncate text-xs text-[#9a8aa0]">
            {formatPeriod(live.periodStart, live.periodEnd)}
          </p>
          {live.venues.length > 0 && (
            <p className="truncate text-xs text-[#9a8aa0]">{venuesLabel(live)}</p>
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
          src={live.keyVisual}
          alt={live.title}
          fill
          fallbackLabel="LIVE"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        {(live.liveType || live.is10th) && (
          <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {live.liveType && <TypeBadge label={live.liveType} />}
            {live.is10th && <TypeBadge label="10TH" tone="rose" />}
          </span>
        )}
        <span className="absolute right-3 top-3">
          <StatusBadge status={status} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug text-[#3a2540]">
          {live.title}
        </h3>
        <p className="text-sm text-[#6a5570]">
          {formatPeriod(live.periodStart, live.periodEnd)}
        </p>
        {live.venues.length > 0 && (
          <p className="line-clamp-1 text-xs text-[#9a8aa0]">{venuesLabel(live)}</p>
        )}
        <span className="mt-auto pt-3 font-display text-xs tracking-[0.15em] text-gold-600 transition-colors group-hover:text-gold-700">
          詳細を見る →
        </span>
      </div>
    </Link>
  )
}
