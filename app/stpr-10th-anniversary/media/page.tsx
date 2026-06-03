import PageContainer from "@/components/common/PageContainer"
import MediaListView from "@/components/media/MediaListView"
import { getMedia } from "@/lib/repo"

export const dynamic = "force-dynamic"

export default async function MediaPage() {
  const media = await getMedia()
  return (
    <PageContainer subtitle="MEDIA" title="メディア">
      <MediaListView media={media} />
    </PageContainer>
  )
}
