"use client"

import { useState } from "react"
import type { SetlistItem, ShowSetlist } from "@/data/lives"

type Variant = "gold" | "plain"

const THEME: Record<
  Variant,
  {
    active: string
    idle: string
    list: string
    num: string
    title: string
    memo: string
    note: string
    hint: string
    changedRow: string // 変更曲の行
    changedTitle: string // 変更曲のタイトル
    badge: string // 「変更」バッジ
  }
> = {
  gold: {
    active: "bg-gold-400 text-white",
    idle: "border border-gold-200 bg-white text-gold-700 hover:bg-gold-50",
    list: "rounded-xl bg-gold-50/40 p-2",
    num: "text-[#9a8aa0]",
    title: "text-[#3a2540]",
    memo: "text-[#9a8aa0]",
    note: "rounded-lg border border-gold-200 bg-gold-50/70 px-3 py-2 text-xs text-[#6a5570]",
    hint: "text-[#9a8aa0]",
    changedRow: "bg-gold-100/70",
    changedTitle: "font-bold text-gold-700",
    badge: "bg-gold-200 text-gold-800",
  },
  plain: {
    active: "bg-accent-600 text-white",
    idle: "border border-gray-200 bg-white text-accent-700 hover:bg-gray-50",
    list: "rounded-lg bg-gray-50 p-2",
    num: "text-accent-600",
    title: "text-gray-800",
    memo: "text-gray-400",
    note: "rounded-lg border border-accent-100 bg-accent-50/60 px-3 py-2 text-xs text-gray-600",
    hint: "text-gray-400",
    changedRow: "bg-accent-50",
    changedTitle: "font-bold text-accent-700",
    badge: "bg-accent-100 text-accent-700",
  },
}

/** タイトル比較用の正規化（空白除去）。 */
function normTitle(s?: string): string {
  return (s ?? "").replace(/\s+/g, "").trim()
}

type Tab = {
  key: string
  label: string
  items: SetlistItem[]
  note?: string
  usesBase: boolean // 自前のセトリが無く基本セトリを流用している
}

/**
 * 基本セトリ＋公演ごとのセトリをタブで切り替えて 1 つだけ表示する。
 * 公演ごとは「変更点メモのみ」「一部差し替え」「完全別セトリ」のどれにも対応：
 *  - 自前のセトリがあればそれを表示（無ければ基本セトリを流用）
 *  - 変更点メモがあれば曲リストの上に表示（時間押しのカット等）
 */
export default function SetlistSelector({
  base,
  showSetlists,
  variant = "gold",
}: {
  base?: SetlistItem[]
  showSetlists?: ShowSetlist[]
  variant?: Variant
}) {
  const t = THEME[variant]
  const hasBase = !!(base && base.length > 0)

  const tabs: Tab[] = []
  if (hasBase) tabs.push({ key: "__base__", label: "基本セトリ", items: base!, usesBase: false })
  for (const ss of showSetlists ?? []) {
    const own = ss.setlist && ss.setlist.length > 0 ? ss.setlist : undefined
    const note = ss.note?.trim() || undefined
    // 公演が指定されていて、独自セトリか変更点メモのどちらかがある場合のみタブ化。
    if (!ss.showRef || (!own && !note)) continue
    tabs.push({
      key: ss.showRef,
      label: ss.showRef,
      items: own ?? base ?? [],
      note,
      usesBase: !own,
    })
  }

  const [active, setActive] = useState(0)
  if (tabs.length === 0) return null

  const idx = Math.min(active, tabs.length - 1)
  const current = tabs[idx]

  // 自前セトリのタブは、基本セトリと曲番号で突き合わせて「変更された曲」を判定する。
  const baseByNum = new Map<number, string>()
  for (const it of base ?? []) {
    if (typeof it.trackNumber === "number") baseByNum.set(it.trackNumber, normTitle(it.title))
  }
  const isDiffTab = current.key !== "__base__" && !current.usesBase && hasBase
  const isChanged = (s: SetlistItem): boolean => {
    if (!isDiffTab || typeof s.trackNumber !== "number") return false
    if (!baseByNum.has(s.trackNumber)) return true // 基本セトリに無い＝追加曲
    return baseByNum.get(s.trackNumber) !== normTitle(s.title)
  }

  // 区分（section）ごとにグループ化（未指定=本編）。出現順を維持し、各区分内は曲番号順。
  const order: string[] = []
  const groups: Record<string, SetlistItem[]> = {}
  for (const it of current.items) {
    const sec = (it.section && it.section.trim()) || "本編"
    if (!groups[sec]) {
      groups[sec] = []
      order.push(sec)
    }
    groups[sec].push(it)
  }
  for (const sec of order) {
    groups[sec].sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
  }
  const multiSection = order.length > 1
  const hasItems = current.items.length > 0

  return (
    <div>
      {tabs.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                i === idx ? t.active : t.idle
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 変更点メモは「自前セトリが無い（基本セトリ流用）」公演のみ表示。
          自前セトリがある公演は下の色分け（変更曲ハイライト）で示す。 */}
      {current.note && current.usesBase && (
        <p className={`mb-2 ${t.note}`}>
          <span className="font-bold">変更点：</span>
          <span className="whitespace-pre-wrap">{current.note}</span>
        </p>
      )}

      {current.usesBase && hasItems && (
        <p className={`mb-1.5 text-[11px] ${t.hint}`}>
          ※ 基本セトリ通り{current.note ? "（上記の変更点あり）" : ""}
        </p>
      )}

      {isDiffTab && hasItems && (
        <p className={`mb-1.5 text-[11px] ${t.hint}`}>
          ※ <span className={`rounded px-1 py-0.5 font-bold ${t.badge}`}>色付き</span> ＝
          基本セトリから変更された曲
        </p>
      )}

      {hasItems && (
        <div className="space-y-3">
          {order.map((sec) => (
            <div key={sec}>
              {multiSection && (
                <p className={`mb-1 text-[11px] font-bold ${t.hint}`}>{sec}</p>
              )}
              <ol className={t.list}>
                {groups[sec].map((s, j) => {
                  const changed = isChanged(s)
                  return (
                    <li
                      key={j}
                      className={`flex items-center gap-3 rounded p-1.5 ${changed ? t.changedRow : ""}`}
                    >
                      <span className={`w-8 shrink-0 text-right text-xs ${t.num}`}>
                        {typeof s.trackNumber === "number"
                          ? String(s.trackNumber).padStart(2, "0")
                          : "－"}
                      </span>
                      <span className={`flex-1 text-sm ${changed ? t.changedTitle : t.title}`}>
                        {s.title || "?"}
                      </span>
                      {changed && (
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${t.badge}`}
                        >
                          変更
                        </span>
                      )}
                      {s.memo && <span className={`text-xs ${t.memo}`}>{s.memo}</span>}
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
