"use client"

import { useState } from "react"
import type { Song } from "@/data/songs"
import { groupByYear } from "@/lib/utils"
import type { SortOrder, ViewMode } from "@/lib/utils"
import SongCard from "./SongCard"
import ListControls from "@/components/common/ListControls"
import FilterTabs from "@/components/common/FilterTabs"
import GroupHeading from "@/components/common/GroupHeading"
import EmptyState from "@/components/common/EmptyState"

const TABS = ["ALL", "ORIGINAL", "Cover"]

/** ミュージック一覧（ALL/ORIGINAL/COVER フィルタ / 年代別 / グリッド・リスト切替 / 並び替え）
 *  showControls=false（TOP 用）でフィルタ・並び替え・表示切替 UI を隠す。 */
export default function MusicListView({
  songs,
  showControls = true,
}: {
  songs: Song[]
  showControls?: boolean
}) {
  const [tab, setTab] = useState("ALL")
  const [sort, setSort] = useState<SortOrder>("newest")
  const [view, setView] = useState<ViewMode>("grid")

  if (songs.length === 0) {
    return <EmptyState label="楽曲情報を準備中です" />
  }

  const filtered = tab === "ALL" ? songs : songs.filter((s) => s.type === tab)
  const groups = groupByYear(filtered, (s) => s.publishedDate, sort)

  return (
    <div className="flex flex-col gap-4">
      {showControls && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs options={TABS} value={tab} onChange={setTab} />
          <ListControls
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState label="該当する楽曲がありません" />
      ) : (
        groups.map(({ year, items }) => (
          <section key={year} className="mt-4">
            <GroupHeading label={year} />
            {view === "grid" ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => (
                  <SongCard key={s.slug} song={s} view="grid" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((s) => (
                  <SongCard key={s.slug} song={s} view="list" />
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  )
}
