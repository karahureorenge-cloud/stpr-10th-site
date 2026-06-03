"use client"

import { useState } from "react"
import type { Album } from "@/data/albums"
import { groupByYear } from "@/lib/utils"
import type { SortOrder } from "@/lib/utils"
import AlbumCard from "./AlbumCard"
import ListControls from "@/components/common/ListControls"
import GroupHeading from "@/components/common/GroupHeading"
import EmptyState from "@/components/common/EmptyState"

/** アルバム一覧（年代別セクション / 並び替え） */
export default function AlbumListView({ albums }: { albums: Album[] }) {
  const [sort, setSort] = useState<SortOrder>("newest")

  if (albums.length === 0) {
    return <EmptyState label="アルバム情報を準備中です" />
  }

  const groups = groupByYear(albums, (a) => a.releaseDate, sort)

  return (
    <div className="flex flex-col gap-2">
      <ListControls
        sort={sort}
        onSortChange={setSort}
        view="grid"
        onViewChange={() => {}}
        showView={false}
      />

      {groups.map(({ year, items }) => (
        <section key={year} className="mt-6">
          <GroupHeading label={year} />
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {items.map((album) => (
              <AlbumCard key={album.slug} album={album} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
