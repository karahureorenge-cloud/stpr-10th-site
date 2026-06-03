"use client"

import { useState } from "react"
import type { Media, MediaType } from "@/data/media"
import EmptyState from "@/components/common/EmptyState"

const TABS: { key: MediaType; label: string }[] = [
  { key: "tv", label: "TV" },
  { key: "radio", label: "RADIO" },
]

/** メディア一覧。
 *  - SP: カード形式（番組名・放送局・放送日・内容）。リンクなし。
 *  - PC: 従来のテーブル形式。
 *  - showControls=false（TOP 用）でタブを隠し、全件（TV/RADIO）を表示する。 */
export default function MediaListView({
  media,
  showControls = true,
}: {
  media: Media[]
  showControls?: boolean
}) {
  const [tab, setTab] = useState<MediaType>("tv")

  if (media.length === 0) {
    return <EmptyState label="メディア情報を準備中です" />
  }

  const filtered = showControls ? media.filter((m) => m.type === tab) : media

  return (
    <div className="flex flex-col gap-6">
      {showControls && (
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-5 py-1.5 font-display text-xs tracking-[0.15em] transition-colors ${
                tab === t.key
                  ? "border-gold-400 bg-gold-400 text-white"
                  : "border-gold-200 bg-white/60 text-[#6a5570] hover:border-gold-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* SP: カード形式（リンクなし） */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-[#9a8aa0]">情報を準備中です</p>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-gold-200/70 bg-white/55 p-4 backdrop-blur-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-[#3a2540]">{m.programName}</h3>
                {m.station && (
                  <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-medium text-gold-700">
                    {m.station}
                  </span>
                )}
              </div>
              {m.dateLabel && (
                <p className="mt-0.5 text-xs text-[#9a8aa0]">{m.dateLabel}</p>
              )}
              {m.content && (
                <p className="mt-1.5 line-clamp-2 text-xs text-[#6a5570]">{m.content}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* PC: テーブル形式 */}
      <div className="hidden overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gold-200/70 text-[11px] uppercase tracking-wider text-gold-600">
              <th className="px-4 py-3 font-medium">番組名</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">放送局</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">放送日</th>
              <th className="px-4 py-3 font-medium">内容</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#9a8aa0]">
                  情報を準備中です
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="border-b border-gold-100/70 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#3a2540]">
                    {m.programName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#6a5570]">{m.station}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#6a5570]">{m.dateLabel}</td>
                  <td className="px-4 py-3 text-[#9a8aa0]">{m.content ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
