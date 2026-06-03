"use client"

import { useState } from "react"
import type { Live } from "@/data/lives"
import { groupByYear } from "@/lib/utils"
import type { SortOrder, ViewMode } from "@/lib/utils"
import LiveCard from "./LiveCard"
import ListControls from "@/components/common/ListControls"
import GroupHeading from "@/components/common/GroupHeading"
import EmptyState from "@/components/common/EmptyState"

/** ライブ一覧（年代別セクション / 並び替え / 表示切替）。カードはSP groupデザイン移植。
 *  showControls=false（TOP 用）で並び替え・表示切替 UI を隠す。 */
export default function LiveListView({
  lives,
  showControls = true,
}: {
  lives: Live[]
  showControls?: boolean
}) {
  const [sort, setSort] = useState<SortOrder>("newest")
  const [view, setView] = useState<ViewMode>("grid")

  if (lives.length === 0) {
    return <EmptyState label="ライブ情報を準備中です" />
  }

  const groups = groupByYear(lives, (l) => l.periodStart, sort)

  // global index（sp-stamp / cheki / holo / 左バー色を fansite と同じく先頭基準で再現）。
  const indexBySlug = new Map<string, number>()
  groups.flatMap((g) => g.items).forEach((l, i) => indexBySlug.set(l.slug, i))

  const gridCls =
    view === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
      : "grid grid-cols-1 gap-3"

  return (
    <div className="theme-strawberry flex flex-col gap-2">
      {showControls && (
        <ListControls
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
        />
      )}

      {groups.map(({ year, items }) => (
        <section key={year} className="mt-6">
          <GroupHeading label={year} />
          <div className={gridCls}>
            {items.map((live) => (
              <LiveCard
                key={live.slug}
                live={live}
                index={indexBySlug.get(live.slug) ?? 0}
                view={view}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
