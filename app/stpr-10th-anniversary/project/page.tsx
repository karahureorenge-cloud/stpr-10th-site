import PageContainer from "@/components/common/PageContainer"
import LinkCard from "@/components/common/LinkCard"
import EmptyState from "@/components/common/EmptyState"
import { getProjects } from "@/lib/repo"

const BASE = "/stpr-10th-anniversary"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "企画",
  description: "すとぷり 10周年の企画情報。",
}

export default async function ProjectPage() {
  const projects = await getProjects()
  return (
    <PageContainer subtitle="PROJECT" title="企画">
      {projects.length === 0 ? (
        <EmptyState label="企画情報を準備中です" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <LinkCard
              key={p.slug}
              href={`${BASE}/project/${p.slug}`}
              seed={p.slug}
              title={p.title}
              thumbnail={p.thumbnail}
              date={p.publishDate}
              category={p.category}
              fallbackLabel="PROJECT"
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
