"use client"

import { useMemo, useState } from "react"
import type { Goods } from "@/data/goods"
import GoodsCard from "./GoodsCard"
import EmptyState from "@/components/common/EmptyState"

/** グッズ一覧（カテゴリタブフィルター付きグリッド） */
export default function GoodsListView({ goods }: { goods: Goods[] }) {
  // データ中に存在するカテゴリ一覧（重複排除・出現順）。
  const categories = useMemo(() => {
    const set: string[] = []
    for (const g of goods) if (!set.includes(g.category)) set.push(g.category)
    return set
  }, [goods])

  const [active, setActive] = useState<string>("ALL")

  const filtered = active === "ALL" ? goods : goods.filter((g) => g.category === active)

  if (goods.length === 0) {
    return <EmptyState label="グッズ情報を準備中です" />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* カテゴリタブ */}
      <div className="flex flex-wrap gap-2">
        {["ALL", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`rounded-full border px-4 py-1.5 text-xs tracking-wider transition-colors ${
              active === cat
                ? "border-gold-400 bg-gold-400 text-white"
                : "border-gold-200 bg-white/60 text-[#6a5570] hover:border-gold-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* グリッド（PC 3列 / SP 2列） */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        {filtered.map((goods) => (
          <GoodsCard key={goods.slug} goods={goods} />
        ))}
      </div>
    </div>
  )
}
