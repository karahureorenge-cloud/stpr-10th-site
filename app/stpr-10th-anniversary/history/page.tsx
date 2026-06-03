import type { Metadata } from "next"
import PageContainer from "@/components/common/PageContainer"
import HistoryView from "@/components/history/HistoryView"
import { getLives, getEvents, getGoods, getMagazines, getMedia } from "@/lib/repo"
import { buildTimeline } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "歩み",
  description: "すとぷり 10周年の年表。ライブ・イベント・グッズ・雑誌・メディアを年ごとに集約。",
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
    <PageContainer subtitle="HISTORY" title="歩み">
      <HistoryView items={items} />
    </PageContainer>
  )
}
