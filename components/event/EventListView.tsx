"use client"

import { useState } from "react"
import type { Event } from "@/data/events"
import type { SortOrder, ViewMode } from "@/lib/utils"
import EventCard from "./EventCard"
import ListControls from "@/components/common/ListControls"
import GroupHeading from "@/components/common/GroupHeading"
import EmptyState from "@/components/common/EmptyState"

// eventType の表示順（既存ファンサイトの EventListView 準拠）。
const EVENT_TYPE_ORDER = [
  "総合イベント",
  "配信",
  "コラボカフェ",
  "キッチンカー",
  "キャンペーン",
  "物販特典",
  "メディア出演",
  "投稿企画",
  "冠番組",
  "大会・コンテスト",
  "その他",
]

/** イベント一覧（eventType 別セクション / グリッド・リスト切替 / 並び替え） */
export default function EventListView({ events }: { events: Event[] }) {
  const [sort, setSort] = useState<SortOrder>("newest")
  const [view, setView] = useState<ViewMode>("grid")

  if (events.length === 0) {
    return <EmptyState label="イベント情報を準備中です" />
  }

  // eventType ごとにグループ化。
  const typeMap = new Map<string, Event[]>()
  for (const e of events) {
    const t = e.eventType || "その他"
    if (!typeMap.has(t)) typeMap.set(t, [])
    typeMap.get(t)!.push(e)
  }

  // 表示順: spec 順 → 残りはアルファベット順。
  const orderedTypes = [
    ...EVENT_TYPE_ORDER.filter((t) => typeMap.has(t)),
    ...[...typeMap.keys()].filter((t) => !EVENT_TYPE_ORDER.includes(t)).sort(),
  ]

  const sortItems = (items: Event[]) =>
    [...items].sort((a, b) => {
      const cmp = (a.periodStart ?? "").localeCompare(b.periodStart ?? "")
      return sort === "newest" ? -cmp : cmp
    })

  return (
    <div className="flex flex-col gap-2">
      <ListControls
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      {orderedTypes.map((type) => {
        const items = sortItems(typeMap.get(type)!)
        return (
          <section key={type} className="mt-6">
            <GroupHeading label={type} />
            {view === "grid" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((e) => (
                  <EventCard key={e.slug} event={e} view="grid" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map((e) => (
                  <EventCard key={e.slug} event={e} view="list" />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
