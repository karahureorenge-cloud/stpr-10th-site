import PageContainer from "@/components/common/PageContainer"
import EventListView from "@/components/event/EventListView"
import { getEvents } from "@/lib/repo"

export const dynamic = "force-dynamic"

export default async function EventPage() {
  const events = await getEvents()
  return (
    <PageContainer subtitle="EVENT" title="イベント">
      <EventListView events={events} />
    </PageContainer>
  )
}
