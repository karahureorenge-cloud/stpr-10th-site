import PageContainer from "@/components/common/PageContainer"
import MagazineListView from "@/components/magazine/MagazineListView"

export const dynamic = "force-dynamic"

export default function MagazinePage() {
  return (
    <PageContainer subtitle="MAGAZINE" title="雑誌">
      <MagazineListView />
    </PageContainer>
  )
}
