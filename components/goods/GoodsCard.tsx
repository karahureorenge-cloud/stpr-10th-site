import Link from "next/link"
import type { Goods } from "@/data/goods"
import { formatDateDot } from "@/lib/utils"
import type { ViewMode } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import TypeBadge from "@/components/common/TypeBadge"

const BASE = "/stpr-10th-anniversary"

/** グッズ一覧のカード（グリッド / リスト 両対応） */
export default function GoodsCard({
  goods,
  view = "grid",
}: {
  goods: Goods
  view?: ViewMode
}) {
  const href = `${BASE}/goods/${goods.slug}`

  if (view === "list") {
    return (
      <Link
        href={href}
        className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 p-3 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"
      >
        <div
          className="relative w-24 shrink-0 self-center overflow-hidden rounded-xl sm:w-28"
          style={{ aspectRatio: "1/1" }}
        >
          <SafeImage
            src={goods.keyVisual}
            alt={goods.title}
            fill
            fallbackLabel="GOODS"
            className="object-cover"
            sizes="112px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1">
            <TypeBadge label={goods.productType} size="sm" />
          </div>
          <h3 className="truncate font-serif text-sm font-bold text-[#3a2540] group-hover:text-gold-700">
            {goods.title}
          </h3>
          {goods.releaseDate && (
            <p className="text-xs text-[#9a8aa0]">{formatDateDot(goods.releaseDate)}</p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm transition-all hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1/1" }}>
        <SafeImage
          src={goods.keyVisual}
          alt={goods.title}
          fill
          fallbackLabel="GOODS"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 768px) 33vw, 50vw"
        />
        <span className="absolute left-2 top-2">
          <TypeBadge label={goods.productType} size="sm" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-[#3a2540]">
          {goods.title}
        </h3>
        {goods.releaseDate && (
          <p className="mt-auto pt-1 text-xs text-[#9a8aa0]">
            {formatDateDot(goods.releaseDate)}
          </p>
        )}
      </div>
    </Link>
  )
}
