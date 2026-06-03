"use client"

import type { SortOrder } from "@/lib/utils"

type Props = {
  value: SortOrder
  onChange: (mode: SortOrder) => void
}

/**
 * 並び替えセレクト（新しい順 / 古い順）。
 * 既存ファンサイトの SortToggle と同構造。配色をゴールドに合わせている。
 */
export default function SortToggle({ value, onChange }: Props) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOrder)}
        aria-label="並び替え"
        className="cursor-pointer appearance-none rounded-full border border-gold-200 bg-white/60 py-1.5 pl-4 pr-8 text-sm text-[#3a2540] backdrop-blur-sm transition-colors hover:border-gold-300"
      >
        <option value="newest">新しい順</option>
        <option value="oldest">古い順</option>
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gold-500">
        ▼
      </span>
    </div>
  )
}
