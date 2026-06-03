import PageContainer from "@/components/common/PageContainer"
import LiveListView from "@/components/live/LiveListView"

export const dynamic = "force-dynamic"

export default function LivePage() {
  return (
    <PageContainer subtitle="LIVE" title="ライブ">
      <LiveListView />
    </PageContainer>
  )
}
