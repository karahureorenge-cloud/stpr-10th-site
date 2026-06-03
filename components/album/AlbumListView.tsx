import { getAlbums } from "@/lib/repo"
import AlbumCard from "./AlbumCard"
import EmptyState from "@/components/common/EmptyState"

/** アルバム一覧（グリッド） */
export default async function AlbumListView() {
  const albums = await getAlbums()

  if (albums.length === 0) {
    return <EmptyState label="アルバム情報を準備中です" />
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {albums.map((album) => (
        <AlbumCard key={album.slug} album={album} />
      ))}
    </div>
  )
}
