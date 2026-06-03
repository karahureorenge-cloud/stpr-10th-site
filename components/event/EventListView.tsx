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

/** イベント一覧（eventType 別セクション / 並び替え / 表示切替）。カードはSP groupデザイン移植。 */
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

  const orderedTypes = [
    ...EVENT_TYPE_ORDER.filter((t) => typeMap.has(t)),
    ...[...typeMap.keys()].filter((t) => !EVENT_TYPE_ORDER.includes(t)).sort(),
  ]

  const sortItems = (items: Event[]) =>
    [...items].sort((a, b) => {
      const cmp = (a.periodStart ?? "").localeCompare(b.periodStart ?? "")
      return sort === "newest" ? -cmp : cmp
    })

  const sortedGroups = orderedTypes.map((type) => ({
    type,
    items: sortItems(typeMap.get(type)!),
  }))

  // global index（sp-stamp / holo / 左バー色を fansite と同じ基準で再現）。
  const indexBySlug = new Map<string, number>()
  sortedGroups.flatMap((g) => g.items).forEach((e, i) => indexBySlug.set(e.slug, i))

  const gridCls =
    view === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
      : "grid grid-cols-1 gap-3"

  return (
    <div className="theme-strawberry flex flex-col gap-2">
      <ListControls
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      {sortedGroups.map(({ type, items }) => (
        <section key={type} className="mt-6">
          <GroupHeading label={type} />
          <div className={gridCls}>
            {items.map((e) => (
              <EventCard
                key={e.slug}
                event={e}
                index={indexBySlug.get(e.slug) ?? 0}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
