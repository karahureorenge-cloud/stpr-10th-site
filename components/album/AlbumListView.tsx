"use client"

import { useState } from "react"
import type { Album } from "@/data/albums"
import type { SortOrder } from "@/lib/utils"
import AlbumCard from "./AlbumCard"
import ListControls from "@/components/common/ListControls"
import EmptyState from "@/components/common/EmptyState"

/** アルバム一覧（年代別セクション / 並び替え）
 *  showControls=false（TOP 用）で並び替え UI を隠す。 */
export default function AlbumListView({
  albums,
  showControls = true,
}: {
  albums: Album[]
  showControls?: boolean
}) {
  const [sort, setSort] = useState<SortOrder>("newest")

  if (albums.length === 0) {
    return <EmptyState label="アルバム情報を準備中です" />
  }

  const sorted = [...albums].sort((a, b) => {
    const cmp = (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "")
    return sort === "newest" ? -cmp : cmp
  })

  return (
    <div className="flex flex-col gap-2">
      {showControls && (
        <ListControls
          sort={sort}
          onSortChange={setSort}
          view="grid"
          onViewChange={() => {}}
          showView={false}
        />
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {sorted.map((album) => (
          <AlbumCard key={album.slug} album={album} />
        ))}
      </div>
    </div>
  )
}
