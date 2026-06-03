import PageContainer from "@/components/common/PageContainer"
import LiveListView from "@/components/live/LiveListView"
import { getLives } from "@/lib/repo"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "ライブ",
  description: "すとぷり 10周年の記念ライブ・公演情報。",
}

export default async function LivePage() {
  const lives = await getLives()
  return (
    <PageContainer subtitle="LIVE" title="ライブ">
      <LiveListView lives={lives} />
    </PageContainer>
  )
}
