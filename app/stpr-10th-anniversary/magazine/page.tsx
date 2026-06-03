import PageContainer from "@/components/common/PageContainer"
import MagazineListView from "@/components/magazine/MagazineListView"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "雑誌",
  description: "すとぷり 10周年の雑誌掲載情報。",
}

export default function MagazinePage() {
  return (
    <PageContainer subtitle="MAGAZINE" title="雑誌">
      <MagazineListView />
    </PageContainer>
  )
}
