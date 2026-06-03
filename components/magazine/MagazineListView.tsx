import type { ReactNode } from "react"
import type { Magazine } from "@/data/magazines"
import { getMagazines } from "@/lib/repo"
import { formatDateDot } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import EmptyState from "@/components/common/EmptyState"

/** 雑誌一覧（カード形式・詳細ページなし）。
 *  magazines 未指定時は自身で取得（既存の /magazine ページ互換）。
 *  SP は 2 列グリッド（画像 + 雑誌名/号数 + 発売日のみ）、
 *  sm 以上は従来の横並びリスト（説明文あり）。 */
export default async function MagazineListView({
  magazines: magazinesProp,
}: {
  magazines?: Magazine[]
} = {}) {
  const magazines = magazinesProp ?? (await getMagazines())

  if (magazines.length === 0) {
    return <EmptyState label="雑誌情報を準備中です" />
  }

  // url があれば外部リンク、無ければ div でラップ。
  const wrap = (mag: Magazine, className: string, children: ReactNode) =>
    mag.url ? (
      <a
        key={mag.id}
        href={mag.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    ) : (
      <div key={mag.id} className={className}>
        {children}
      </div>
    )

  return (
    <>
      {/* SP: 2 列グリッド（画像 + 雑誌名/号数 + 発売日のみ・説明文なし） */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {magazines.map((mag) =>
          wrap(
            mag,
            "group flex flex-col rounded-2xl border border-gold-200/70 bg-white/55 p-2 backdrop-blur-sm transition-transform active:scale-95",
            <>
              <div
                className="relative w-full overflow-hidden rounded-lg"
                style={{ aspectRatio: "3/4" }}
              >
                <SafeImage
                  src={mag.image}
                  alt={mag.name}
                  fill
                  fallbackLabel="MAG"
                  className="object-cover"
                  sizes="45vw"
                />
              </div>
              <h3 className="mt-2 line-clamp-2 font-serif text-xs font-bold leading-snug text-[#3a2540]">
                {mag.name}
              </h3>
              <p className="text-[11px] text-[#6a5570]">{mag.issue}</p>
              {mag.releaseDate && (
                <p className="mt-0.5 text-[10px] text-[#9a8aa0]">
                  発売: {formatDateDot(mag.releaseDate)}
                </p>
              )}
            </>,
          ),
        )}
      </div>

      {/* sm 以上: 従来の横並びリスト（説明文あり） */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2">
        {magazines.map((mag) =>
          wrap(
            mag,
            "group flex gap-4 rounded-2xl border border-gold-200/70 bg-white/55 p-3 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]",
            <>
              <div
                className="relative shrink-0 overflow-hidden rounded-lg"
                style={{ width: 80, aspectRatio: "3/4" }}
              >
                <SafeImage
                  src={mag.image}
                  alt={mag.name}
                  fill
                  fallbackLabel="MAG"
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 py-1">
                <h3 className="font-serif text-sm font-bold leading-snug text-[#3a2540]">
                  {mag.name}
                </h3>
                <p className="text-xs text-[#6a5570]">{mag.issue}</p>
                {mag.content && (
                  <p className="text-xs text-[#9a8aa0]">{mag.content}</p>
                )}
                {mag.releaseDate && (
                  <p className="mt-auto text-[11px] text-[#9a8aa0]">
                    発売: {formatDateDot(mag.releaseDate)}
                  </p>
                )}
              </div>
            </>,
          ),
        )}
      </div>
    </>
  )
}
