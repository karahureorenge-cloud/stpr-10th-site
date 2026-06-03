import Link from "next/link"
import type { Album } from "@/data/albums"
import { formatDateDot } from "@/lib/utils"
import SafeImage from "@/components/common/SafeImage"

const BASE = "/stpr-10th-anniversary"

/** アルバム一覧のカード */
export default function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`${BASE}/album/${album.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm transition-all hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(212,168,83,0.22)]"
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1/1" }}>
        <SafeImage
          src={album.cover}
          alt={album.title}
          fill
          fallbackLabel="ALBUM"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 768px) 25vw, 50vw"
        />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-[#3a2540]">
          {album.title}
        </h3>
        {album.releaseDate && (
          <p className="text-xs text-[#9a8aa0]">{formatDateDot(album.releaseDate)}</p>
        )}
      </div>
    </Link>
  )
}
