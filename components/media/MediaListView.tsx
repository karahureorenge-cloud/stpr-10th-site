"use client"

import { useState } from "react"
import type { Media, MediaType } from "@/data/media"
import EmptyState from "@/components/common/EmptyState"

const TABS: { key: MediaType; label: string }[] = [
  { key: "tv", label: "TV" },
  { key: "radio", label: "RADIO" },
]

/** メディア一覧（TV / RADIO タブ・表形式） */
export default function MediaListView({ media }: { media: Media[] }) {
  const [tab, setTab] = useState<MediaType>("tv")

  if (media.length === 0) {
    return <EmptyState label="メディア情報を準備中です" />
  }

  const filtered = media.filter((m) => m.type === tab)

  return (
    <div className="flex flex-col gap-6">
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

      <div className="overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gold-200/70 text-[11px] uppercase tracking-wider text-gold-600">
              <th className="px-4 py-3 font-medium">番組名</th>
              <th className="px-4 py-3 font-medium">放送局</th>
              <th className="px-4 py-3 font-medium">放送日</th>
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
                    {m.url ? (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-700 underline-offset-2 hover:underline"
                      >
                        {m.programName}
                      </a>
                    ) : (
                      m.programName
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#6a5570]">{m.station}</td>
                  <td className="px-4 py-3 text-[#6a5570]">{m.dateLabel}</td>
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
