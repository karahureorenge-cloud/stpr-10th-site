import PageContainer from "@/components/common/PageContainer"
import EventListView from "@/components/event/EventListView"

export const dynamic = "force-dynamic"

export default function EventPage() {
  return (
    <PageContainer subtitle="EVENT" title="イベント">
      <EventListView />
    </PageContainer>
  )
}
