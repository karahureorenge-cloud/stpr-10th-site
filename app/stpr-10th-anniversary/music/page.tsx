import PageContainer from "@/components/common/PageContainer"
import MusicListView from "@/components/music/MusicListView"
import { getSongs } from "@/lib/repo"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "ミュージック",
  description: "すとぷり 10周年の楽曲・MV情報。",
}

export default async function MusicPage() {
  const songs = await getSongs()
  return (
    <PageContainer subtitle="MUSIC" title="ミュージック">
      <MusicListView songs={songs} />
    </PageContainer>
  )
}
