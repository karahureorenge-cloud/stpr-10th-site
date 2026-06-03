import { notFound } from "next/navigation"
import { formatPeriod } from "@/lib/utils"
import { getEventBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"

export const dynamic = "force-dynamic"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div
        className="relative w-full overflow-hidden rounded-3xl border border-gold-200/70"
        style={{ aspectRatio: "16/9" }}
      >
        <SafeImage
          src={event.keyVisual}
          alt={event.title}
          fill
          fallbackLabel="EVENT"
          className="object-cover"
          sizes="(min-width: 768px) 768px, 100vw"
          priority
        />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <span className="w-fit rounded-full bg-rose-400/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white">
          {event.eventType}
        </span>
        <h1 className="font-serif text-2xl font-bold leading-snug text-[#3a2540]">
          {event.title}
        </h1>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-gold-600">日程</dt>
            <dd className="text-[#3a2540]">
              {formatPeriod(event.periodStart, event.periodEnd)}
            </dd>
          </div>
          {event.hashtag && (
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-gold-600">タグ</dt>
              <dd className="text-[#3a2540]">{event.hashtag}</dd>
            </div>
          )}
        </dl>

        {event.description && (
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#6a5570]">
            {event.description}
          </p>
        )}

        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center rounded-full bg-gold-400 px-8 py-3 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500"
          >
            詳細・参加方法 →
          </a>
        )}
      </div>
    </div>
  )
}
