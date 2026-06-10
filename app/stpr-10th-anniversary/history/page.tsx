import type { Metadata } from "next"
import PageContainer from "@/components/common/PageContainer"
import HistoryView from "@/components/history/HistoryView"
import {
  getTenthLives,
  getEvents,
  getGoods,
  getMagazines,
  getMedia,
  getStreams,
  getProjects,
  getSongs,
  getMovies,
} from "@/lib/repo"
import { buildTimeline } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "スケジュール",
  description:
    "すとぷり 10周年のスケジュール。ライブ・イベント・グッズ・配信・企画・楽曲・動画・雑誌・メディアを年ごと・カレンダーで集約。",
}

export default async function HistoryPage() {
  const [lives, events, goods, magazines, media, streams, projects, songs, movies] =
    await Promise.all([
      getTenthLives(),
      getEvents(),
      getGoods(),
      getMagazines(),
      getMedia(),
      getStreams(),
      getProjects(),
      getSongs(),
      getMovies(),
    ])

  const items = buildTimeline({
    lives,
    events,
    goods,
    magazines,
    media,
    streams,
    projects,
    songs,
    movies,
  })

  return (
    <PageContainer subtitle="SCHEDULE" title="スケジュール">
      <HistoryView items={items} />
    </PageContainer>
  )
}
