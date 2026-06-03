"use client"

import { useMemo, useState } from "react"
import type { Goods } from "@/data/goods"
import { groupByYear } from "@/lib/utils"
import type { SortOrder, ViewMode } from "@/lib/utils"
import GoodsCard from "./GoodsCard"
import ListControls from "@/components/common/ListControls"
import FilterTabs from "@/components/common/FilterTabs"
import GroupHeading from "@/components/common/GroupHeading"
import EmptyState from "@/components/common/EmptyState"

/** グッズ一覧（カテゴリフィルタ / 年代別 / 並び替え / 表示切替）。カードはSP groupデザイン移植。
 *  showControls=false（TOP 用）でフィルタ・並び替え・表示切替 UI を隠す。 */
export default function GoodsListView({
  goods,
  showControls = true,
}: {
  goods: Goods[]
  showControls?: boolean
}) {
  const categories = useMemo(() => {
    const set: string[] = []
    for (const g of goods) if (!set.includes(g.productType)) set.push(g.productType)
    return ["ALL", ...set]
  }, [goods])

  const [category, setCategory] = useState("ALL")
  const [sort, setSort] = useState<SortOrder>("newest")
  const [view, setView] = useState<ViewMode>("grid")

  if (goods.length === 0) {
    return <EmptyState label="グッズ情報を準備中です" />
  }

  const filtered =
    category === "ALL" ? goods : goods.filter((g) => g.productType === category)
  const groups = groupByYear(filtered, (g) => g.releaseDate, sort)

  const indexBySlug = new Map<string, number>()
  groups.flatMap((g) => g.items).forEach((g, i) => indexBySlug.set(g.slug, i))

  const gridCls =
    view === "grid"
      ? // LiveListView と同じ列数（SP 1 列）に統一し、カードサイズを揃える。
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
      : "grid grid-cols-1 gap-3"

  return (
    <div className="theme-strawberry flex flex-col gap-4">
      {showControls && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs options={categories} value={category} onChange={setCategory} />
          <ListControls
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState label="該当するグッズがありません" />
      ) : (
        groups.map(({ year, items }) => (
          <section key={year} className="mt-4">
            <GroupHeading label={year} />
            <div className={gridCls}>
              {items.map((g) => (
                <GoodsCard
                  key={g.slug}
                  goods={g}
                  index={indexBySlug.get(g.slug) ?? 0}
                  view={view}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
