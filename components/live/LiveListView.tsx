"use client"

import { useState } from "react"
import Link from "next/link"
import type { Live } from "@/data/lives"
import { getLiveStatus, groupByYear, formatPeriod, venuesSummary } from "@/lib/utils"
import type { SortOrder, ViewMode } from "@/lib/utils"
import LiveCard from "./LiveCard"
import ListControls from "@/components/common/ListControls"
import GroupHeading from "@/components/common/GroupHeading"
import StatusBadge from "@/components/common/StatusBadge"
import TypeBadge from "@/components/common/TypeBadge"
import EmptyState from "@/components/common/EmptyState"

const BASE = "/stpr-10th-anniversary"

/** ライブ一覧（年代別セクション / グリッド・リスト切替 / 並び替え） */
export default function LiveListView({ lives }: { lives: Live[] }) {
  const [sort, setSort] = useState<SortOrder>("newest")
  const [view, setView] = useState<ViewMode>("grid")

  if (lives.length === 0) {
    return <EmptyState label="ライブ情報を準備中です" />
  }

  const groups = groupByYear(lives, (l) => l.periodStart, sort)

  return (
    <div className="flex flex-col gap-2">
      <ListControls
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      {groups.map(({ year, items }) => (
        <section key={year} className="mt-6">
          <GroupHeading label={year} />
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((live) => (
                <LiveCard key={live.slug} live={live} view="grid" />
              ))}
            </div>
          ) : (
            <>
              {/* モバイル: 横並びカード */}
              <div className="flex flex-col gap-2 sm:hidden">
                {items.map((live) => (
                  <LiveCard key={live.slug} live={live} view="list" />
                ))}
              </div>
              {/* PC: テーブル（既存ファンサイト準拠） */}
              <div className="hidden overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm sm:block">
                <LiveTable lives={items} />
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  )
}

function LiveTable({ lives }: { lives: Live[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gold-200/70 text-[11px] uppercase tracking-wider text-gold-600">
          <th className="px-4 py-3 font-medium" style={{ width: "50%" }}>
            タイトル
          </th>
          <th className="px-4 py-3 font-medium" style={{ width: "25%" }}>
            日程
          </th>
          <th className="px-4 py-3 font-medium" style={{ width: "25%" }}>
            会場
          </th>
        </tr>
      </thead>
      <tbody>
        {lives.map((live) => {
          const status = live.periodStart
            ? getLiveStatus(live.periodStart, live.periodEnd)
            : live.status
          return (
            <tr
              key={live.slug}
              className="border-b border-gold-100/70 align-top last:border-0 hover:bg-gold-50/40"
            >
              <td className="px-4 py-3">
                <Link
                  href={`${BASE}/live/${live.slug}`}
                  className="font-bold text-[#3a2540] hover:text-gold-700"
                >
                  {live.title}
                </Link>
                <div className="mt-1 flex flex-wrap gap-1">
                  {live.liveType && <TypeBadge label={live.liveType} size="sm" />}
                  {live.is10th && <TypeBadge label="10TH" tone="rose" size="sm" />}
                  <StatusBadge status={status} size="sm" />
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-[#6a5570]">
                {formatPeriod(live.periodStart, live.periodEnd)}
              </td>
              <td className="px-4 py-3 text-xs text-[#6a5570]">
                {live.venues.length === 0 ? "会場未定" : venuesSummary(live.venues)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
