"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const BASE = "/stpr-10th-anniversary"

// ナビ項目。href は BASE からの相対セグメント（"" はトップ）。
const NAV_ITEMS: { label: string; segment: string }[] = [
  { label: "TOP", segment: "" },
  { label: "LIVE", segment: "live" },
  { label: "GOODS", segment: "goods" },
  { label: "EVENT", segment: "event" },
  { label: "MUSIC", segment: "music" },
  { label: "ALBUM", segment: "album" },
  { label: "VISUAL", segment: "visual" },
  { label: "MAGAZINE", segment: "magazine" },
  { label: "MEDIA", segment: "media" },
  { label: "HISTORY", segment: "history" },
  { label: "ABOUT", segment: "about" },
]

/**
 * スティッキーナビ（PC ヘッダー）。
 * - backdrop-blur + 半透明白背景
 * - アクティブ項目はゴールドのボーダーボトム
 * - SP（md 未満）では非表示。代わりに画面下部の BottomNav を使用する。
 * - MUSIC / ALBUM はデータがある場合のみ表示（hasMusic / hasAlbum）。
 */
export default function NavBar({
  hasMusic = true,
  hasAlbum = true,
  hasVisual = true,
}: {
  hasMusic?: boolean
  hasAlbum?: boolean
  hasVisual?: boolean
}) {
  const pathname = usePathname()

  const items = NAV_ITEMS.filter((item) => {
    if (item.segment === "music") return hasMusic
    if (item.segment === "album") return hasAlbum
    if (item.segment === "visual") return hasVisual
    return true
  })

  const isActive = (segment: string) => {
    const href = segment ? `${BASE}/${segment}` : BASE
    if (segment === "") return pathname === BASE || pathname === `${BASE}/`
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="sticky top-0 z-[100] hidden border-b border-gold-200/60 bg-white/70 backdrop-blur-md md:block">
      <ul className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 py-1 sm:gap-2 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const href = item.segment ? `${BASE}/${item.segment}` : BASE
          const active = isActive(item.segment)
          return (
            <li key={item.label} className="shrink-0">
              <Link
                href={href}
                className={`block whitespace-nowrap border-b-2 px-2.5 py-3 font-display text-xs tracking-[0.18em] transition-colors sm:text-sm ${
                  active
                    ? "border-gold-400 text-gold-700"
                    : "border-transparent text-[#6a5570] hover:text-gold-600"
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
