"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { TimelineCategory, TimelineItem } from "@/lib/utils"

type Props = {
  items: TimelineItem[]
}

const CATEGORY_META: Record<
  TimelineCategory,
  { label: string; bg: string; text: string }
> = {
  anniversary: { label: "10TH", bg: "bg-gold-100", text: "text-gold-700" },
  live: { label: "LIVE", bg: "bg-rose-100", text: "text-rose-600" },
  event: { label: "EVENT", bg: "bg-amber-100", text: "text-amber-700" },
  goods: { label: "GOODS", bg: "bg-emerald-100", text: "text-emerald-700" },
  magazine: { label: "MAGAZINE", bg: "bg-violet-100", text: "text-violet-700" },
  media: { label: "MEDIA", bg: "bg-sky-100", text: "text-sky-700" },
}

const CATEGORY_FILTER_OPTIONS: { key: "all" | TimelineCategory; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "live", label: "LIVE" },
  { key: "event", label: "EVENT" },
  { key: "goods", label: "GOODS" },
  { key: "magazine", label: "MAGAZINE" },
  { key: "media", label: "MEDIA" },
]

function fmtMD(dateStr: string): string {
  const m = dateStr.match(/^\d{4}-(\d{2})-(\d{2})$/)
  if (!m) return dateStr
  return `${Number(m[1])}/${Number(m[2])}`
}

function fmtRange(startDate: string, endDate?: string): string {
  const start = fmtMD(startDate)
  if (!endDate || endDate === startDate) return start
  return `${start}-${fmtMD(endDate)}`
}

/**
 * 10周年 HISTORY 年表ビュー（既存ファンサイトの HistoryView を移植・簡略化）。
 * - グループフィルタは廃止（単一作品）。年タブ + カテゴリーフィルタ + 縦タイムライン。
 * - アクセントはサイトカラー（ゴールド）。
 */
export default function HistoryView({ items }: Props) {
  const years = useMemo(() => {
    const set = new Set<number>()
    items.forEach((i) => set.add(i.year))
    // 古い→新しい（時系列順）
    return [...set].sort((a, b) => a - b)
  }, [items])

  const [year, setYear] = useState<number | undefined>(years[0])
  const [category, setCategory] = useState<"all" | TimelineCategory>("all")

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-[#9a8aa0]">
        年表データを準備中です
      </div>
    )
  }

  const currentYear =
    year !== undefined && years.includes(year) ? year : years[0]
  const filteredAll = items.filter(
    (i) => category === "all" || i.category === category,
  )
  const filteredYear = filteredAll.filter((i) => i.year === currentYear)

  return (
    <>
      {/* 年タブ */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {years.map((y) => {
          const isActive = y === currentYear
          return (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${
                isActive
                  ? "border-gold-400 bg-gold-400 text-white"
                  : "border-gold-200 bg-white text-[#6a5570] hover:border-gold-300 hover:text-gold-600"
              }`}
            >
              {y}
            </button>
          )
        })}
      </div>

      {/* カテゴリーフィルタ */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-[#9a8aa0]">
            Category
          </span>
          {CATEGORY_FILTER_OPTIONS.map((opt) => {
            const isActive = category === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setCategory(opt.key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-gold-400 bg-gold-400 text-white"
                    : "border-gold-200 bg-white text-[#6a5570] hover:border-gold-300 hover:text-gold-600"
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-[#9a8aa0]">
          {currentYear} 年: {filteredYear.length} 件
          {category !== "all" && (
            <span className="ml-1 text-gold-300">/ 全期間 {filteredAll.length} 件</span>
          )}
        </p>
      </div>

      {/* 年見出し */}
      <div className="mb-5 flex items-center gap-3">
        <span className="block h-7 w-1 rounded-sm bg-gold-400" aria-hidden />
        <h2 className="font-serif text-2xl font-bold tabular-nums text-[#3a2540] md:text-3xl">
          {currentYear}
        </h2>
      </div>

      {/* アイテム一覧 */}
      {filteredYear.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#9a8aa0]">
          条件に一致する出来事がありません
        </div>
      ) : (
        <ol className="relative ml-4 border-l border-gold-200">
          {filteredYear.map((item, i) => {
            const meta = CATEGORY_META[item.category]
            const isExternal = item.href.startsWith("http")
            const isHash = item.href === "#"
            const dateLabel = fmtRange(item.date, item.endDate)

            // 10周年記念日: ゴールド強調の特別エントリ
            if (item.category === "anniversary") {
              return (
                <li
                  key={`${item.date}-anniv-${i}`}
                  className="relative pb-5 pl-6 last:pb-0"
                >
                  <span
                    className="absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full bg-gold-400 ring-2 ring-white"
                    aria-hidden
                  />
                  <div className="rounded-xl border border-gold-300 bg-gradient-to-r from-gold-100 to-rose-100 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums text-gold-700">
                        {dateLabel}
                      </span>
                      <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        10TH
                      </span>
                    </div>
                    <p className="mt-1 font-serif text-base font-bold text-[#3a2540]">
                      ★ {item.title}
                    </p>
                  </div>
                </li>
              )
            }

            return (
              <li
                key={`${item.date}-${item.category}-${i}`}
                className="relative pb-5 pl-6 last:pb-0"
              >
                <span
                  className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold-400 ring-2 ring-white"
                  aria-hidden
                />
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                  <span className="shrink-0 pt-0.5 font-mono text-xs tabular-nums text-[#9a8aa0] sm:w-24">
                    {dateLabel}
                  </span>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <span
                      className={`inline-block w-16 shrink-0 rounded ${meta.bg} ${meta.text} px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    {isHash ? (
                      <span className="text-sm font-medium text-[#3a2540]">
                        {item.title}
                      </span>
                    ) : isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#3a2540] transition-colors hover:text-gold-600 hover:underline"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-sm font-medium text-[#3a2540] transition-colors hover:text-gold-600 hover:underline"
                      >
                        {item.title}
                      </Link>
                    )}
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-[#9a8aa0]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}
