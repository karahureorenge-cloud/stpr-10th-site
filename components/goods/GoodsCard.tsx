import Link from "next/link"
import type { Goods } from "@/data/goods"
import type { ViewMode } from "@/lib/utils"
import "@/components/group/strawberry-prince/strawberry-prince.css"

const BASE = "/stpr-10th-anniversary"

/**
 * グッズカード（既存ファンサイト すとぷりグループページから完全移植）。
 * sp-card / sp-sticker / sp-cheki-frame / sp-stamp をそのまま使用。
 * データソースのみ Supabase（10th 型）に差し替え（keyVisual は文字列URL）。
 */
export default function GoodsCard({
  goods,
  index = 0,
  view = "grid",
}: {
  goods: Goods
  index?: number
  view?: ViewMode
}) {
  const idx = index
  const productType = goods.productType
  const useCheki = idx < 2

  // リスト表示: 画像小さめ（左）+ テキスト（右）の横長 1 行レイアウト。
  if (view === "list") {
    return (
      <Link
        href={`${BASE}/goods/${goods.slug}`}
        className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 p-3 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"
      >
        <div
          className="relative w-28 shrink-0 overflow-hidden rounded-xl bg-white/40 sm:w-40"
          style={{ aspectRatio: "16/9" }}
        >
          {goods.keyVisual && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={goods.keyVisual} alt={goods.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold" style={{ color: "var(--sp-text)" }}>
            {goods.title}
          </h3>
          {productType && (
            <p className="mt-1 text-xs" style={{ color: "var(--sp-text-soft)" }}>
              {productType}
            </p>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`${BASE}/goods/${goods.slug}`}
      className="sp-card sp-shimmer-on-hover sp-sticker relative block group p-3"
    >
      {idx === 0 && (
        <span className="sp-stamp absolute z-10" style={{ top: 10, left: 10 }}>
          NEW
        </span>
      )}
      {idx === 1 && (
        <span
          className="sp-stamp sp-stamp--blue absolute z-10"
          style={{ top: 10, left: 10 }}
        >
          LIMITED
        </span>
      )}
      {useCheki ? (
        <div className="sp-cheki-frame">
          <div className="aspect-video rounded overflow-hidden bg-white/40">
            {goods.keyVisual && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={goods.keyVisual}
                alt={goods.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            )}
          </div>
          <p
            className="mt-2 text-sm font-bold truncate text-center"
            style={{ color: "var(--sp-text)" }}
          >
            {goods.title}
          </p>
          {productType && (
            <p
              className="text-[10px] mt-0.5 text-center"
              style={{ color: "var(--sp-text-soft)" }}
            >
              {productType}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="aspect-video rounded-xl overflow-hidden bg-white/40">
            {goods.keyVisual && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={goods.keyVisual}
                alt={goods.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            )}
          </div>
          <p
            className="mt-3 text-sm font-bold truncate"
            style={{ color: "var(--sp-text)" }}
          >
            {goods.title}
          </p>
          {productType && (
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--sp-text-soft)" }}
            >
              {productType}
            </p>
          )}
        </>
      )}
    </Link>
  )
}
