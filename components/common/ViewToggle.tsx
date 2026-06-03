"use client"

import type { ViewMode } from "@/lib/utils"

type Props = {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

/**
 * グリッド / リスト表示切替。
 * 既存ファンサイトの ViewToggle と同構造。アクティブ色をゴールドにしている。
 */
export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div
      className="flex rounded-full border border-gold-200 bg-white/60 p-1 backdrop-blur-sm"
      role="group"
      aria-label="表示切替"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={value === "grid"}
        aria-label="グリッド表示"
        className={`flex items-center justify-center rounded-full px-3 py-1 transition-colors ${
          value === "grid"
            ? "bg-gold-400 text-white"
            : "bg-transparent text-[#9a8aa0] hover:text-gold-600"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={value === "list"}
        aria-label="リスト表示"
        className={`flex items-center justify-center rounded-full px-3 py-1 transition-colors ${
          value === "list"
            ? "bg-gold-400 text-white"
            : "bg-transparent text-[#9a8aa0] hover:text-gold-600"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <rect x="1" y="2" width="14" height="2" rx="1" />
          <rect x="1" y="7" width="14" height="2" rx="1" />
          <rect x="1" y="12" width="14" height="2" rx="1" />
        </svg>
      </button>
    </div>
  )
}
