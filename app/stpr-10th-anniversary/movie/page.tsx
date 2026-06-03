import PageContainer from "@/components/common/PageContainer"
import LinkCard from "@/components/common/LinkCard"
import EmptyState from "@/components/common/EmptyState"
import { getMovies } from "@/lib/repo"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "動画",
  description: "すとぷり 10周年の動画情報。",
}

export default async function MoviePage() {
  const movies = await getMovies()
  return (
    <PageContainer subtitle="MOVIE" title="動画">
      {movies.length === 0 ? (
        <EmptyState label="動画情報を準備中です" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((m) => (
            <LinkCard
              key={m.id}
              href={m.url}
              external
              seed={m.id}
              title={m.title}
              thumbnail={m.thumbnail}
              date={m.publishDate}
              category={m.category}
              fallbackLabel="MOVIE"
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
