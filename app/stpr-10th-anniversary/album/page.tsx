import PageContainer from "@/components/common/PageContainer"
import AlbumListView from "@/components/album/AlbumListView"

export const dynamic = "force-dynamic"

export default function AlbumPage() {
  return (
    <PageContainer subtitle="ALBUM" title="アルバム">
      <AlbumListView />
    </PageContainer>
  )
}
