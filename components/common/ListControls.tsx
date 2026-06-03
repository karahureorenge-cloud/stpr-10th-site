"use client"

import type { SortOrder, ViewMode } from "@/lib/utils"
import SortToggle from "./SortToggle"
import ViewToggle from "./ViewToggle"

type Props = {
  sort: SortOrder
  onSortChange: (v: SortOrder) => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  /** 表示切替を出すか（テーブル固定の一覧では false） */
  showView?: boolean
}

/**
 * 一覧右上の「並び替え + 表示切替」コントロール行。
 * 既存ファンサイトの各 ListView 右上と同じ配置。
 */
export default function ListControls({
  sort,
  onSortChange,
  view,
  onViewChange,
  showView = true,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <SortToggle value={sort} onChange={onSortChange} />
      {showView && <ViewToggle value={view} onChange={onViewChange} />}
    </div>
  )
}
