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

/** グッズ一覧（カテゴリフィルタ / 年代別セクション / グリッド・リスト切替 / 並び替え） */
export default function GoodsListView({ goods }: { goods: Goods[] }) {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs options={categories} value={category} onChange={setCategory} />
        <ListControls
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState label="該当するグッズがありません" />
      ) : (
        groups.map(({ year, items }) => (
          <section key={year} className="mt-4">
            <GroupHeading label={year} />
            {view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                {items.map((g) => (
                  <GoodsCard key={g.slug} goods={g} view="grid" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((g) => (
                  <GoodsCard key={g.slug} goods={g} view="list" />
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  )
}
