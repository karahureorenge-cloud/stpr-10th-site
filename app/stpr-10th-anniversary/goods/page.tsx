import PageContainer from "@/components/common/PageContainer"
import GoodsListView from "@/components/goods/GoodsListView"
import { getGoods } from "@/lib/repo"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "グッズ",
  description: "すとぷり 10周年の記念グッズ情報。",
}

export default async function GoodsPage() {
  const goods = await getGoods()
  return (
    <PageContainer subtitle="GOODS" title="グッズ">
      <GoodsListView goods={goods} />
    </PageContainer>
  )
}
