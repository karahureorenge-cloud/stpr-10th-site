import { notFound } from "next/navigation"
import { getMemberById, formatDate } from "@/lib/utils"
import { getGoodsBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"

export const dynamic = "force-dynamic"

export default async function GoodsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const goods = await getGoodsBySlug(slug)
  if (!goods) notFound()

  const members = (goods.memberIds ?? [])
    .map(getMemberById)
    .filter((m): m is NonNullable<typeof m> => Boolean(m))

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* 画像 */}
        <div
          className="relative w-full overflow-hidden rounded-3xl border border-gold-200/70"
          style={{ aspectRatio: "1/1" }}
        >
          <SafeImage
            src={goods.keyVisual}
            alt={goods.title}
            fill
            fallbackLabel="GOODS"
            className="object-cover"
            sizes="(min-width: 768px) 384px, 100vw"
            priority
          />
        </div>

        {/* 情報 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="w-fit rounded-full bg-gold-400/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white">
              {goods.productType}
            </span>
            {goods.saleType && (
              <span className="w-fit rounded-full bg-rose-400/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white">
                {goods.saleType}
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl font-bold leading-snug text-[#3a2540]">
            {goods.title}
          </h1>

          <dl className="flex flex-col gap-2 text-sm">
            {goods.releaseDate && (
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-gold-600">発売日</dt>
                <dd className="text-[#3a2540]">{formatDate(goods.releaseDate)}</dd>
              </div>
            )}
            {goods.salePeriod && (
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-gold-600">販売期間</dt>
                <dd className="text-[#3a2540]">{goods.salePeriod}</dd>
              </div>
            )}
            {goods.price && (
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-gold-600">価格</dt>
                <dd className="text-[#3a2540]">{goods.price}</dd>
              </div>
            )}
            {goods.deliveryInfo && (
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-gold-600">配送</dt>
                <dd className="text-[#3a2540]">{goods.deliveryInfo}</dd>
              </div>
            )}
          </dl>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m.id}
                  className="rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {m.name}
                </span>
              ))}
            </div>
          )}

          {goods.description && (
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#6a5570]">
              {goods.description}
            </p>
          )}

          {goods.purchaseUrl && (
            <a
              href={goods.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-fit items-center rounded-full bg-gold-400 px-8 py-3 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500"
            >
              購入ページ →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
