import PageContainer from "@/components/common/PageContainer"
import LinkCard from "@/components/common/LinkCard"
import EmptyState from "@/components/common/EmptyState"
import { getStreams } from "@/lib/repo"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "配信",
  description: "すとぷり 10周年の配信情報。",
}

export default async function StreamPage() {
  const streams = await getStreams()
  return (
    <PageContainer subtitle="STREAM" title="配信">
      {streams.length === 0 ? (
        <EmptyState label="配信情報を準備中です" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {streams.map((s) => (
            <LinkCard
              key={s.id}
              href={s.url}
              external
              seed={s.id}
              title={s.title}
              thumbnail={s.thumbnail}
              date={s.publishDate}
              category={s.category}
              fallbackLabel="STREAM"
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
