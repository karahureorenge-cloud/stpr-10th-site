"use client"

import { useState } from "react"
import type { Event } from "@/data/events"
import type { SortOrder, ViewMode } from "@/lib/utils"
import EventCard from "./EventCard"
import ListControls from "@/components/common/ListControls"
import EmptyState from "@/components/common/EmptyState"

/** イベント一覧（種別で分けずフラット表示 / 並び替え / 表示切替）。
 *  種別は各カード内に小さく表示する（EventCard）。
 *  showControls=false（TOP 用）で並び替え・表示切替 UI を隠す。 */
export default function EventListView({
  events,
  showControls = true,
}: {
  events: Event[]
  showControls?: boolean
}) {
  const [sort, setSort] = useState<SortOrder>("newest")
  const [view, setView] = useState<ViewMode>("grid")

  if (events.length === 0) {
    return <EmptyState label="イベント情報を準備中です" />
  }

  // 種別でグルーピングせず、日付（periodStart）でフラットに並べる。
  const sorted = [...events].sort((a, b) => {
    const cmp = (a.periodStart ?? "").localeCompare(b.periodStart ?? "")
    return sort === "newest" ? -cmp : cmp
  })

  const gridCls =
    view === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
      : "grid grid-cols-1 gap-3"

  return (
    <div className="theme-strawberry flex flex-col gap-4">
      {showControls && (
        <ListControls
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
        />
      )}

      <div className={gridCls}>
        {sorted.map((e, i) => (
          <EventCard key={e.slug} event={e} index={i} view={view} />
        ))}
      </div>
    </div>
  )
}
