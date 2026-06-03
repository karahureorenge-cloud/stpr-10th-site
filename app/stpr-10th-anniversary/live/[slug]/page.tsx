import { notFound } from "next/navigation"
import { getLiveStatus } from "@/lib/utils"
import { getLiveBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"
import StatusBadge from "@/components/common/StatusBadge"
import SectionHeading from "@/components/common/SectionHeading"

export const dynamic = "force-dynamic"

export default async function LiveDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const live = await getLiveBySlug(slug)
  if (!live) notFound()

  const status = live.startDate
    ? getLiveStatus(live.startDate, live.endDate)
    : live.status

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* キービジュアル */}
      <div
        className="relative w-full overflow-hidden rounded-3xl border border-gold-200/70"
        style={{ aspectRatio: "16/9" }}
      >
        <SafeImage
          src={live.keyVisual}
          alt={live.title}
          fill
          fallbackLabel="LIVE"
          className="object-cover"
          sizes="(min-width: 768px) 768px, 100vw"
          priority
        />
        <div className="absolute left-4 top-4">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <h1 className="font-serif text-2xl font-bold leading-snug text-[#3a2540] sm:text-3xl">
          {live.title}
        </h1>

        <dl className="flex flex-col gap-3 text-sm">
          <Row label="日程">{live.dateLabel}</Row>
          {live.venues.length > 0 && (
            <Row label="会場">
              <ul className="flex flex-col gap-1">
                {live.venues.map((v, i) => (
                  <li key={i} className="text-[#3a2540]">
                    <span className="font-medium">{v.name}</span>
                    <span className="text-[#9a8aa0]">（{v.prefecture}）</span>
                    {v.date && <span className="ml-1 text-[#6a5570]">{v.date}</span>}
                    {v.partLabel && (
                      <span className="ml-1 text-[#6a5570]">{v.partLabel}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {live.note && <Row label="備考">{live.note}</Row>}
        </dl>

        {live.description && (
          <div className="flex flex-col gap-4">
            <SectionHeading subtitle="ABOUT" title="この公演について" variant="compact" />
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#6a5570]">
              {live.description}
            </p>
          </div>
        )}

        {live.ticketUrl && (
          <a
            href={live.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center rounded-full bg-gold-400 px-8 py-3 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500"
          >
            チケット情報 →
          </a>
        )}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gold-100/70 pb-3 sm:flex-row sm:gap-4">
      <dt className="w-24 shrink-0 font-display text-xs tracking-wider text-gold-600">
        {label}
      </dt>
      <dd className="flex-1 text-[#3a2540]">{children}</dd>
    </div>
  )
}
