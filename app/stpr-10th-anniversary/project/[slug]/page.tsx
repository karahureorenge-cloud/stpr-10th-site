import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDateDot } from "@/lib/utils"
import { getProjectBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"
import ImageGallery from "@/components/common/ImageGallery"

const BASE = "/stpr-10th-anniversary"

export const dynamic = "force-dynamic"

function isHttpUrl(u?: string): boolean {
  return !!u && /^https?:\/\//i.test(u)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: "企画が見つかりません" }
  const description = project.description?.slice(0, 100) || project.title
  const images = project.thumbnail ? [project.thumbnail] : []
  return {
    title: project.title,
    description,
    openGraph: { title: project.title, description, images },
    twitter: { card: "summary_large_image", title: project.title, description, images },
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const period =
    project.periodStart || project.periodEnd
      ? `${formatDateDot(project.periodStart)}${
          project.periodEnd && project.periodEnd !== project.periodStart
            ? ` 〜 ${formatDateDot(project.periodEnd)}`
            : ""
        }`
      : ""

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      {/* パンくず */}
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#9a8aa0]">
        <Link href={`${BASE}/project`} className="transition-colors hover:text-gold-600">
          PROJECT
        </Link>
        <span className="text-gold-200">›</span>
        <span className="font-medium text-[#3a2540]">{project.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr] md:gap-8">
        {/* サムネイル */}
        <div className="relative mx-auto aspect-video w-full max-w-[420px] overflow-hidden rounded-2xl border border-gold-200/70 bg-gold-50/40 shadow-sm md:max-w-[320px]">
          <SafeImage
            src={project.thumbnail}
            alt={project.title}
            fill
            fallbackLabel="PROJECT"
            className="object-cover"
            sizes="(min-width: 768px) 320px, 100vw"
            priority
          />
        </div>

        {/* 基本情報 */}
        <div className="flex flex-col gap-3">
          <span className="font-display text-[11px] tracking-[0.3em] text-gold-600">PROJECT</span>
          <h1 className="font-serif text-2xl font-bold text-[#3a2540] md:text-3xl">
            {project.title}
          </h1>

          <dl className="mt-1 flex flex-col gap-2 text-sm">
            {project.category && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[#9a8aa0]">カテゴリ</dt>
                <dd className="text-[#3a2540]">{project.category}</dd>
              </div>
            )}
            {project.publishDate && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[#9a8aa0]">公開日</dt>
                <dd className="text-[#3a2540]">{formatDateDot(project.publishDate)}</dd>
              </div>
            )}
            {period && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-[#9a8aa0]">期間</dt>
                <dd className="text-[#3a2540]">{period}</dd>
              </div>
            )}
          </dl>

          {isHttpUrl(project.url) && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block w-fit rounded-xl bg-gold-400 px-5 py-2 text-sm text-white transition-colors hover:bg-gold-500"
            >
              公式サイト →
            </a>
          )}
        </div>
      </div>

      {/* 説明 */}
      {project.description && (
        <section className="mt-6 rounded-2xl border border-gold-200/70 bg-white/55 p-4 shadow-sm backdrop-blur-sm md:p-6">
          <h2 className="mb-3 font-serif font-bold text-[#3a2540]">企画について</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#6a5570]">
            {project.description}
          </p>
        </section>
      )}

      {/* 画像ギャラリー（全サムネ + 全画面ライトボックス） */}
      {project.images.length > 0 && (
        <section className="mt-6 rounded-2xl border border-gold-200/70 bg-white/55 p-4 shadow-sm backdrop-blur-sm md:p-6">
          <h2 className="mb-3 font-serif font-bold text-[#3a2540]">ギャラリー</h2>
          <ImageGallery images={project.images} />
        </section>
      )}

      {/* 一覧へ戻る */}
      <div className="mt-8">
        <Link
          href={`${BASE}/project`}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-white/70 px-5 py-2 text-sm text-gold-700 transition-colors hover:bg-gold-50"
        >
          ← 企画一覧へ
        </Link>
      </div>
    </div>
  )
}
