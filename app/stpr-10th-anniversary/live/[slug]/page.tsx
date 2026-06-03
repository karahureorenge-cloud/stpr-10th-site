import { notFound } from "next/navigation"
import { getLiveStatus, formatVenueName, formatPeriod } from "@/lib/utils"
import { getLiveBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"
import StatusBadge from "@/components/common/StatusBadge"
import TypeBadge from "@/components/common/TypeBadge"
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

  const status = live.periodStart
    ? getLiveStatus(live.periodStart, live.periodEnd)
    : live.status

  const tickets = live.ticketInfo ?? []

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
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {live.liveType && <TypeBadge label={live.liveType} />}
          {live.is10th && <TypeBadge label="10TH" tone="rose" />}
        </div>
        <div className="absolute right-4 top-4">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <h1 className="font-serif text-2xl font-bold leading-snug text-[#3a2540] sm:text-3xl">
          {live.title}
        </h1>

        <dl className="flex flex-col gap-3 text-sm">
          <Row label="日程">{formatPeriod(live.periodStart, live.periodEnd)}</Row>
          {live.venues.length > 0 && (
            <Row label="会場">
              <ul className="flex flex-col gap-2">
                {live.venues.map((v, i) => (
                  <li key={i} className="text-[#3a2540]">
                    <span className="font-medium">{formatVenueName(v)}</span>
                    {v.shows && v.shows.length > 0 && (
                      <ul className="mt-0.5 flex flex-col gap-0.5 pl-3">
                        {v.shows.map((s, si) => (
                          <li key={si} className="text-xs text-[#6a5570]">
                            {[s.date, s.partLabel, s.scheduleText]
                              .filter(Boolean)
                              .join(" ")}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {live.hashtag && <Row label="ハッシュタグ">{live.hashtag}</Row>}
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

        {tickets.length > 0 && (
          <div className="flex flex-col gap-4">
            <SectionHeading subtitle="TICKET" title="チケット情報" variant="compact" />
            <div className="flex flex-col gap-3">
              {tickets.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gold-200/70 bg-white/55 p-4 backdrop-blur-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#3a2540]">{t.ticketType}</span>
                    {t.status && <TypeBadge label={t.status} size="sm" />}
                  </div>
                  <dl className="mt-1.5 flex flex-col gap-0.5 text-xs text-[#6a5570]">
                    {t.price && <div>価格: {t.price}</div>}
                    {t.salePeriod && <div>販売期間: {t.salePeriod}</div>}
                    {t.method && <div>申込方式: {t.method}</div>}
                    {t.info && <div>{t.info}</div>}
                  </dl>
                  {t.purchaseUrl && (
                    <a
                      href={t.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-fit items-center rounded-full bg-gold-400 px-6 py-2 font-display text-xs tracking-[0.15em] text-white transition-colors hover:bg-gold-500"
                    >
                      申し込む →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(live.officialSiteUrl || live.officialPlaylistUrl) && (
          <div className="flex flex-wrap gap-3">
            {live.officialSiteUrl && (
              <a
                href={live.officialSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center rounded-full border border-gold-300 px-6 py-2.5 font-display text-xs tracking-[0.15em] text-gold-700 transition-colors hover:bg-gold-50"
              >
                公式サイト ↗
              </a>
            )}
            {live.officialPlaylistUrl && (
              <a
                href={live.officialPlaylistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center rounded-full border border-gold-300 px-6 py-2.5 font-display text-xs tracking-[0.15em] text-gold-700 transition-colors hover:bg-gold-50"
              >
                プレイリスト ↗
              </a>
            )}
          </div>
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
