import type { Metadata } from "next"
import PageContainer from "@/components/common/PageContainer"
import HistoryView from "@/components/history/HistoryView"
import { getLives, getEvents, getGoods, getMagazines, getMedia } from "@/lib/repo"
import { buildTimeline } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "スケジュール",
  description: "すとぷり 10周年のスケジュール。ライブ・イベント・グッズ・雑誌・メディアを年ごと・カレンダーで集約。",
}

export default async function HistoryPage() {
  const [lives, events, goods, magazines, media] = await Promise.all([
    getLives(),
    getEvents(),
    getGoods(),
    getMagazines(),
    getMedia(),
  ])

  const items = buildTimeline({ lives, events, goods, magazines, media })

  return (
    <PageContainer subtitle="SCHEDULE" title="スケジュール">
      <HistoryView items={items} />
    </PageContainer>
  )
}
