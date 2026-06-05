"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { TimelineCategory, TimelineItem } from "@/lib/utils"

type Props = {
  items: TimelineItem[]
  // 会場公演（schedules）チップ。live のチップ表示はこちらに置き換える。
  schedules?: TimelineItem[]
}

// カテゴリ別のチップ配色（HistoryView と統一）。
const CATEGORY_META: Record<TimelineCategory, { label: string; bg: string; text: string }> = {
  anniversary: { label: "10TH", bg: "bg-gold-100", text: "text-gold-700" },
  live: { label: "LIVE", bg: "bg-rose-100", text: "text-rose-600" },
  event: { label: "EVENT", bg: "bg-amber-100", text: "text-amber-700" },
  goods: { label: "GOODS", bg: "bg-emerald-100", text: "text-emerald-700" },
  magazine: { label: "MAGAZINE", bg: "bg-violet-100", text: "text-violet-700" },
  media: { label: "MEDIA", bg: "bg-sky-100", text: "text-sky-700" },
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * HISTORY 月カレンダービュー（外部ライブラリ不使用の自前実装）。
 * - 各日付にイベント・グッズ等のチップを表示。ライブは会場公演（schedules）単位で各公演日に表示。
 * - 今日の日付はゴールドの枠線でハイライト。
 * - 日付クリックで「その日に始まる出来事」+「🔥 開催中（期間が重なるもの）」を下部表示。
 *   「開催中」はライブ全体の期間（period_start〜period_end）で判定する。
 * - 初期表示はアイテムが存在する月（最も早い日付の月）。
 */
export default function HistoryCalendar({ items, schedules = [] }: Props) {
  // 日付（YYYY-MM-DD）→ チップ配列。
  // live は会場公演（schedules）チップに置き換えるため items の live は除外する。
  // （items の live アイテムは下部「開催中」判定のためにそのまま保持する。）
  const byDate = useMemo(() => {
    const map = new Map<string, TimelineItem[]>()
    const add = (it: TimelineItem) => {
      const arr = map.get(it.date)
      if (arr) arr.push(it)
      else map.set(it.date, [it])
    }
    for (const it of items) {
      if (it.category === "live") continue
      add(it)
    }
    for (const s of schedules) add(s)
    return map
  }, [items, schedules])

  // 今日（YYYY-MM-DD）。クライアントの現在時刻で算出。
  const today = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }, [])

  // 初期月: 今日（new Date()）の年月。開いたときは常に当月を表示する。
  const initial = useMemo(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() + 1 }
  }, [])

  const [cur, setCur] = useState(initial)
  const [selected, setSelected] = useState<string | null>(null)

  const goPrev = () => {
    setSelected(null)
    setCur((c) => (c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 }))
  }
  const goNext = () => {
    setSelected(null)
    setCur((c) => (c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 }))
  }

  // 当月のグリッド（先頭の空白 + 各日）。
  const cells = useMemo(() => {
    const firstWeekday = new Date(cur.y, cur.m - 1, 1).getDay()
    const daysInMonth = new Date(cur.y, cur.m, 0).getDate()
    const arr: (number | null)[] = []
    for (let i = 0; i < firstWeekday; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [cur])

  const dateKey = (d: number) => `${cur.y}-${pad(cur.m)}-${pad(d)}`
  // その日に「始まる」出来事（開始日が一致）。
  const selectedItems = selected ? (byDate.get(selected) ?? []) : []
  // その日に「開催中」の出来事（period_start < 選択日 <= period_end）。
  // 開始日当日は selectedItems 側に出すため、ここでは開始日より後〜終了日までを対象にする。
  const ongoingItems = selected
    ? items.filter((it) => it.endDate && it.date < selected && selected <= it.endDate)
    : []

  return (
    <div>
      {/* 月ナビ */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full border border-gold-200 bg-white px-3 py-1.5 text-sm text-[#6a5570] transition-colors hover:border-gold-300 hover:text-gold-600"
          aria-label="前の月"
        >
          ‹ 前月
        </button>
        <h2 className="font-serif text-xl font-bold tabular-nums text-[#3a2540] md:text-2xl">
          {cur.y}年 {cur.m}月
        </h2>
        <button
          type="button"
          onClick={goNext}
          className="rounded-full border border-gold-200 bg-white px-3 py-1.5 text-sm text-[#6a5570] transition-colors hover:border-gold-300 hover:text-gold-600"
          aria-label="次の月"
        >
          翌月 ›
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#9a8aa0]">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-1 ${i === 0 ? "text-rose-400" : i === 6 ? "text-sky-500" : ""}`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) {
            return <div key={`empty-${i}`} className="min-h-[64px] rounded-lg md:min-h-[88px]" />
          }
          const key = dateKey(d)
          const dayItems = byDate.get(key) ?? []
          const isSelected = selected === key
          const isToday = key === today
          const weekday = (i % 7)
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(isSelected ? null : key)}
              className={`flex min-h-[64px] flex-col rounded-lg border p-1 text-left transition-colors md:min-h-[88px] ${
                isSelected
                  ? "border-gold-400 bg-gold-50"
                  : dayItems.length > 0
                    ? "border-gold-200/70 bg-white/70 hover:bg-gold-50/60"
                    : "border-transparent bg-white/30"
              } ${isToday ? "ring-2 ring-gold-400 ring-offset-1" : ""}`}
            >
              <span
                className={`flex items-center gap-1 text-[11px] font-bold tabular-nums ${
                  weekday === 0 ? "text-rose-400" : weekday === 6 ? "text-sky-500" : "text-[#6a5570]"
                }`}
              >
                {d}
                {isToday && (
                  <span className="rounded-full bg-gold-400 px-1 text-[8px] font-bold leading-tight text-white">
                    今日
                  </span>
                )}
              </span>
              {/* チップ（最大2件 + 残数）。SP では点表示に切替。 */}
              <div className="mt-0.5 flex flex-col gap-0.5">
                {dayItems.slice(0, 2).map((it, idx) => {
                  const meta = CATEGORY_META[it.category]
                  return (
                    <span
                      key={idx}
                      className={`hidden truncate rounded px-1 py-0.5 text-[9px] font-bold leading-tight md:block ${meta.bg} ${meta.text}`}
                      title={it.title}
                    >
                      {it.title}
                    </span>
                  )
                })}
                {dayItems.length > 2 && (
                  <span className="hidden text-[9px] text-[#9a8aa0] md:block">
                    +{dayItems.length - 2}
                  </span>
                )}
                {/* モバイル: カテゴリ色のドット */}
                {dayItems.length > 0 && (
                  <span className="flex flex-wrap gap-0.5 md:hidden">
                    {dayItems.slice(0, 4).map((it, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${CATEGORY_META[it.category].bg}`}
                      />
                    ))}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_META) as TimelineCategory[]).map((c) => (
          <span
            key={c}
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${CATEGORY_META[c].bg} ${CATEGORY_META[c].text}`}
          >
            {CATEGORY_META[c].label}
          </span>
        ))}
      </div>

      {/* 選択日の詳細（その日に始まる出来事 + 開催中） */}
      {selected && (selectedItems.length > 0 || ongoingItems.length > 0) && (
        <div className="mt-5 rounded-2xl border border-gold-200/70 bg-white/70 p-4">
          <p className="mb-3 font-serif text-sm font-bold text-[#3a2540]">{selected} の出来事</p>
          {selectedItems.length > 0 ? (
            <ItemList items={selectedItems} />
          ) : (
            <p className="text-xs text-[#9a8aa0]">この日に始まる出来事はありません。</p>
          )}

          {/* 開催中（選択日に期間が重なっているもの） */}
          {ongoingItems.length > 0 && (
            <div className="mt-4 border-t border-gold-100/70 pt-3">
              <p className="mb-3 text-sm font-bold text-rose-500">🔥 開催中</p>
              <ItemList items={ongoingItems} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** 選択日詳細・開催中で共用するアイテムリスト。 */
function ItemList({ items }: { items: TimelineItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it, i) => {
        const meta = CATEGORY_META[it.category]
        const isExternal = it.href.startsWith("http")
        const isHash = it.href === "#"
        const label = (
          <span className="flex items-center gap-2">
            <span
              className={`inline-block w-16 shrink-0 rounded ${meta.bg} ${meta.text} px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider`}
            >
              {meta.label}
            </span>
            <span className="text-sm font-medium text-[#3a2540]">{it.title}</span>
          </span>
        )
        if (isHash) return <li key={i}>{label}</li>
        return (
          <li key={i}>
            {isExternal ? (
              <a
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                {label}
              </a>
            ) : (
              <Link href={it.href} className="transition-opacity hover:opacity-70">
                {label}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
