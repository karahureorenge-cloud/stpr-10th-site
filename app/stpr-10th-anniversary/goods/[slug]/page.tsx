import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getMemberById, formatDateDot } from "@/lib/utils"
import { getGoodsBySlug } from "@/lib/repo"
import SafeImage from "@/components/common/SafeImage"

const BASE = "/stpr-10th-anniversary"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const goods = await getGoodsBySlug(slug)
  if (!goods) return { title: "グッズが見つかりません" }
  const description = goods.description?.slice(0, 100) || `${goods.title}の詳細`
  const images = goods.keyVisual ? [goods.keyVisual] : []
  return {
    title: goods.title,
    description,
    openGraph: { title: goods.title, description, images },
    twitter: { card: "summary_large_image", title: goods.title, description, images },
  }
}

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
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* パンくず */}
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#9a8aa0]">
        <Link href={`${BASE}/goods`} className="transition-colors hover:text-gold-600">
          GOODS
        </Link>
        <span className="text-gold-200">›</span>
        <span className="font-medium text-[#3a2540]">{goods.title}</span>
      </nav>

      {/* HERO：キービジュアル・タイトル・販売種別・販売期間・配送情報 */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm">
        {goods.keyVisual && (
          <div className="relative aspect-[16/9] w-full">
            <SafeImage
              src={goods.keyVisual}
              alt={goods.title}
              fill
              fallbackLabel="GOODS"
              className="object-cover"
              sizes="(min-width: 768px) 1152px, 100vw"
              priority
            />
          </div>
        )}
        <div className="p-4 md:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {goods.productType && (
              <span className="rounded-full bg-gold-400/95 px-3 py-1 text-xs font-bold text-white">
                {goods.productType}
              </span>
            )}
            {goods.saleType && (
              <span className="rounded-full bg-rose-400/90 px-3 py-1 text-xs font-bold text-white">
                {goods.saleType}
              </span>
            )}
          </div>
          <h1 className="mb-2 font-serif text-xl font-bold text-[#3a2540] md:text-3xl">
            {goods.title}
          </h1>
          <div className="mb-3 space-y-1 text-sm text-[#6a5570]">
            {goods.releaseDate && <p>発売日: {formatDateDot(goods.releaseDate)}</p>}
            {goods.salePeriod && <p>販売期間: {goods.salePeriod}</p>}
            {goods.price && <p>価格: {goods.price}</p>}
            {goods.deliveryInfo && <p>{goods.deliveryInfo}</p>}
          </div>
          {members.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
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
            <p className="whitespace-pre-wrap text-sm text-[#6a5570]">{goods.description}</p>
          )}
        </div>
      </div>

      {/* 購入リンク */}
      {goods.purchaseUrl && (
        <div className="mb-6">
          <a
            href={goods.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl bg-gold-400 py-4 text-center font-bold text-white transition-colors hover:bg-gold-500"
          >
            購入ページへ →
          </a>
        </div>
      )}

      {/* ラインナップ画像 */}
      {goods.lineupImages && goods.lineupImages.length > 0 && (
        <section className="mb-6 rounded-2xl border border-gold-200/70 bg-white/55 p-4 shadow-sm backdrop-blur-sm md:p-6">
          <h2 className="mb-4 font-serif font-bold text-[#3a2540]">ラインナップ</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {goods.lineupImages.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`${goods.title} ${i + 1}`} className="w-full rounded-xl" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
