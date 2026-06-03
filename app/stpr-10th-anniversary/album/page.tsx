import PageContainer from "@/components/common/PageContainer"
import AlbumListView from "@/components/album/AlbumListView"
import { getAlbums } from "@/lib/repo"

export const dynamic = "force-dynamic"

export default async function AlbumPage() {
  const albums = await getAlbums()
  return (
    <PageContainer subtitle="ALBUM" title="アルバム">
      <AlbumListView albums={albums} />
    </PageContainer>
  )
}
