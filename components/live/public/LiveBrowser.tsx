"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Live, Venue, Show } from "@/data/lives"
import {
  formatDateDot,
  formatPeriod,
  formatVenueName,
  getLiveStatus,
  groupByYear,
  type SortOrder,
  type ViewMode,
} from "@/lib/utils"
import GroupTabs from "@/components/live/public/GroupTabs"

type Props = {
  lives: Live[]
}

/** ステータスバッジ（種別バッジは別途）。 */
function StatusBadge({ live, small }: { live: Live; small?: boolean }) {
  const state = getLiveStatus(live.periodStart, live.periodEnd)
  const size = small ? "text-[10px] px-2 py-0.5" : "text-xs px-2 py-1"
  if (state === "coming")
    return <span className={`rounded-full bg-slate-500 font-bold text-white ${size}`}>COMING SOON</span>
  if (state === "ongoing")
    return <span className={`rounded-full bg-green-500 font-bold text-white ${size} ${small ? "" : "animate-pulse"}`}>● LIVE NOW</span>
  return <span className={`rounded-full bg-gray-500/80 font-bold text-white ${size}`}>FINISHED</span>
}

function TypeBadge({ live, small }: { live: Live; small?: boolean }) {
  if (!live.liveType) return null
  const size = small ? "text-[10px] px-2 py-0.5" : "text-xs px-2 py-1"
  return <span className={`rounded-full bg-accent-600 font-bold text-white ${size}`}>{live.liveType}</span>
}

function showLine(v: Venue, show: Show) {
  return [
    show.date ? `${formatDateDot(show.date)}予定` : null,
    show.partLabel || null,
    formatVenueName(v),
  ]
    .filter(Boolean)
    .join(" ")
}

function LiveBrowserInner({ lives }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentGroup = searchParams.get("group") ?? "all"
  const sort = (searchParams.get("sort") ?? "newest") as SortOrder
  const view = (searchParams.get("view") ?? "grid") as ViewMode

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggleExpanded = (slug: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) params.delete(key)
    else params.set(key, value)
    const q = params.toString()
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }

  const filtered =
    currentGroup === "all"
      ? lives
      : lives.filter(
          (l) => l.groupSlug === currentGroup || (l.groupSlugs ?? []).includes(currentGroup),
        )

  const groups = groupByYear(filtered, (l) => l.periodStart, sort)

  return (
    <>
      <GroupTabs currentSlug={currentGroup} />

      <div className="mb-4 mt-3 flex flex-wrap items-center justify-end gap-2">
        {/* 並び替え */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value === "newest" ? null : e.target.value)}
            aria-label="並び替え"
            className="cursor-pointer appearance-none rounded-full border border-gray-300 bg-white py-1.5 pl-4 pr-8 text-sm transition-colors hover:border-accent-400"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            ▼
          </span>
        </div>
        {/* 表示切替 */}
        <div className="flex rounded-full bg-gray-100 p-1" role="group" aria-label="表示切替">
          <button
            type="button"
            onClick={() => setParam("view", "grid")}
            aria-pressed={view === "grid"}
            aria-label="グリッド表示"
            className="flex items-center justify-center rounded-full px-3 py-1 text-xs transition-colors"
            style={view === "grid" ? { backgroundColor: "#005397", color: "#fff" } : { color: "#6b7280" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setParam("view", "list")}
            aria-pressed={view === "list"}
            aria-label="リスト表示"
            className="flex items-center justify-center rounded-full px-3 py-1 text-xs transition-colors"
            style={view === "list" ? { backgroundColor: "#005397", color: "#fff" } : { color: "#6b7280" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <rect x="1" y="2" width="14" height="2" rx="1" />
              <rect x="1" y="7" width="14" height="2" rx="1" />
              <rect x="1" y="12" width="14" height="2" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">該当するライブがありません</div>
      ) : (
        groups.map(({ year, items }) => (
          <section key={year} className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-accent-600">
              <span className="inline-block h-5 w-1 rounded-sm bg-accent-600" aria-hidden />
              {year}
            </h2>

            {view === "grid" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((live) => (
                  <GridCard key={live.slug} live={live} />
                ))}
              </div>
            ) : (
              <>
                {/* モバイル: 横並びカード */}
                <div className="space-y-2 sm:hidden">
                  {items.map((live) => (
                    <ListCard key={live.slug} live={live} />
                  ))}
                </div>
                {/* PC: Wikipedia 風テーブル */}
                <div className="hidden sm:block">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                        <th className="w-1/2 pb-2 pr-4 font-medium">タイトル</th>
                        <th className="w-1/4 pb-2 pr-4 font-medium">日程</th>
                        <th className="w-1/4 pb-2 font-medium">会場</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((live) => (
                        <TableRow
                          key={live.slug}
                          live={live}
                          isOpen={expanded.has(live.slug)}
                          onToggle={() => toggleExpanded(live.slug)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        ))
      )}
    </>
  )
}

function GridCard({ live }: { live: Live }) {
  return (
    <Link
      href={`/live/${live.slug}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div style={{ aspectRatio: "16 / 9" }} className="relative overflow-hidden bg-gray-100">
        {live.keyVisual ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={live.keyVisual}
            alt={live.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            キービジュアルなし
          </div>
        )}
        <span className="absolute left-2 top-2">
          <TypeBadge live={live} />
        </span>
        <span className="absolute right-2 top-2">
          <StatusBadge live={live} />
        </span>
      </div>
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-tight text-gray-800">{live.title}</h3>
        <div className="text-xs text-gray-500">{formatPeriod(live.periodStart, live.periodEnd)}</div>
      </div>
    </Link>
  )
}

function ListCard({ live }: { live: Live }) {
  return (
    <Link
      href={`/live/${live.slug}`}
      className="group flex items-center gap-3 overflow-hidden rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        style={{ aspectRatio: "16 / 9" }}
        className="relative w-32 shrink-0 self-center overflow-hidden rounded bg-gray-100"
      >
        {live.keyVisual ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={live.keyVisual} alt={live.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No Image</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <TypeBadge live={live} small />
          <StatusBadge live={live} small />
        </div>
        <h3 className="truncate text-sm font-bold text-gray-800 group-hover:text-accent-600">{live.title}</h3>
        <p className="text-xs text-gray-400">{formatPeriod(live.periodStart, live.periodEnd)}</p>
      </div>
    </Link>
  )
}

function TableRow({ live, isOpen, onToggle }: { live: Live; isOpen: boolean; onToggle: () => void }) {
  const venues = live.venues ?? []
  const showCount = venues.reduce(
    (sum, v) => sum + (v.shows && v.shows.length > 0 ? v.shows.length : 1),
    0,
  )

  return (
    <tr className="border-b border-gray-100 align-top hover:bg-gray-50">
      <td className="py-2 pr-4">
        <Link href={`/live/${live.slug}`} className="font-semibold text-gray-800 hover:text-accent-600">
          {live.title}
        </Link>
        <div className="mt-1 flex flex-wrap gap-1">
          <TypeBadge live={live} small />
          <StatusBadge live={live} small />
        </div>
      </td>
      <td className="whitespace-nowrap py-2 pr-4 text-xs text-gray-500">
        {formatPeriod(live.periodStart, live.periodEnd)}
      </td>
      <td className="py-2 text-xs text-gray-600">
        {venues.length === 0 ? (
          <span>会場未定</span>
        ) : venues.length === 1 ? (
          <span>{formatVenueName(venues[0])}</span>
        ) : (
          <>
            <span>
              {venues.length}会場{showCount}公演
              <button
                type="button"
                onClick={onToggle}
                className="ml-1 cursor-pointer text-xs text-accent-600 underline"
              >
                {isOpen ? "隠す▲" : "展開▼"}
              </button>
            </span>
            {isOpen && (
              <div className="mt-1 space-y-0.5 border-t border-gray-100 pt-1">
                {venues.flatMap((v, vi) =>
                  v.shows && v.shows.length > 0
                    ? v.shows.map((show, si) => (
                        <div key={`${vi}-${si}`} className="whitespace-nowrap text-xs text-gray-500">
                          {showLine(v, show)}
                        </div>
                      ))
                    : [
                        <div key={`${vi}-x`} className="whitespace-nowrap text-xs text-gray-500">
                          {formatVenueName(v)}
                        </div>,
                      ],
                )}
              </div>
            )}
          </>
        )}
      </td>
    </tr>
  )
}

/** useSearchParams を使うため Suspense でラップ。 */
export default function LiveBrowser(props: Props) {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-gray-400">読み込み中…</div>}>
      <LiveBrowserInner {...props} />
    </Suspense>
  )
}
