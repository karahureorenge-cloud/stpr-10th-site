import { getMagazines } from "@/lib/repo"
import { formatDate } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"
import EmptyState from "@/components/common/EmptyState"

/** 雑誌一覧（カード形式・詳細ページなし） */
export default async function MagazineListView() {
  const magazines = await getMagazines()

  if (magazines.length === 0) {
    return <EmptyState label="雑誌情報を準備中です" />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {magazines.map((mag) => {
        const inner = (
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
                  発売: {formatDate(mag.releaseDate)}
                </p>
              )}
            </div>
          </>
        )

        const className =
          "group flex gap-4 rounded-2xl border border-gold-200/70 bg-white/55 p-3 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"

        return mag.url ? (
          <a
            key={mag.id}
            href={mag.url}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {inner}
          </a>
        ) : (
          <div key={mag.id} className={className}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}
