import PageContainer from "@/components/common/PageContainer"
import EventListView from "@/components/event/EventListView"
import { getEvents } from "@/lib/repo"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "イベント",
  description: "すとぷり 10周年のイベント情報。",
}

export default async function EventPage() {
  const events = await getEvents()
  return (
    <PageContainer subtitle="EVENT" title="イベント">
      <EventListView events={events} />
    </PageContainer>
  )
}
