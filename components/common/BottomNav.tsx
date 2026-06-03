"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const BASE = "/stpr-10th-anniversary"

// メニュー項目。TOP/各セクションは同一ページのアンカー、VISUAL/HISTORY は専用ページ。
type NavItem = {
  label: string
  href: string
  needs?: "music" | "album" | "visual" | "project" | "movie" | "stream"
}
const ITEMS: NavItem[] = [
  { label: "TOP", href: BASE },
  { label: "LIVE", href: `${BASE}#live` },
  { label: "EVENT", href: `${BASE}#event` },
  { label: "GOODS", href: `${BASE}#goods` },
  { label: "MUSIC", href: `${BASE}#music`, needs: "music" },
  { label: "ALBUM", href: `${BASE}#album`, needs: "album" },
  { label: "VISUAL", href: `${BASE}/visual`, needs: "visual" },
  { label: "MAGAZINE", href: `${BASE}#magazine` },
  { label: "MEDIA", href: `${BASE}#media` },
  { label: "PROJECT", href: `${BASE}/project`, needs: "project" },
  { label: "MOVIE", href: `${BASE}/movie`, needs: "movie" },
  { label: "STREAM", href: `${BASE}/stream`, needs: "stream" },
  { label: "HISTORY", href: `${BASE}/history` },
  { label: "ABOUT", href: `${BASE}/about` },
]

/**
 * SP（スマホ）専用ナビ。
 * - 右下にハンバーガーボタンを固定表示
 * - タップで下からメニュー（ボトムシート）が出る
 * - 各項目タップで該当セクション/ページへ遷移し、メニューは閉じる
 * - MUSIC / ALBUM / VISUAL はデータがある場合のみ表示
 * - md 以上では非表示（PC はヘッダーナビ）
 */
export default function BottomNav({
  hasMusic,
  hasAlbum,
  hasVisual,
  hasProject,
  hasMovie,
  hasStream,
}: {
  hasMusic: boolean
  hasAlbum: boolean
  hasVisual: boolean
  hasProject: boolean
  hasMovie: boolean
  hasStream: boolean
}) {
  const [open, setOpen] = useState(false)

  const items = ITEMS.filter((it) => {
    if (it.needs === "music") return hasMusic
    if (it.needs === "album") return hasAlbum
    if (it.needs === "visual") return hasVisual
    if (it.needs === "project") return hasProject
    if (it.needs === "movie") return hasMovie
    if (it.needs === "stream") return hasStream
    return true
  })

  // メニュー表示中は背景スクロールを抑止し、Esc で閉じる。
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="md:hidden">
      {/* ハンバーガーボタン（右下固定） */}
      <button
        type="button"
        aria-label="メニューを開く"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[110] flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/70 bg-gradient-to-br from-rose-300 to-gold-400 text-white shadow-lg transition-transform active:scale-95"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden
        >
          {open ? (
            <path d="M6 6 L18 18 M18 6 L6 18" />
          ) : (
            <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
          )}
        </svg>
      </button>

      {/* ボトムシート（下から） */}
      {open && (
        <div
          className="fixed inset-0 z-[105]"
          role="dialog"
          aria-modal="true"
          aria-label="セクションメニュー"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-[#3a2540]/40 backdrop-blur-sm" />
          <nav
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-gold-200/80 bg-white/95 px-4 pt-3 shadow-2xl backdrop-blur-md"
            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gold-200" />
            <ul className="flex flex-wrap justify-center gap-2">
              {items.map((it) => (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="block min-w-[92px] whitespace-nowrap rounded-xl border border-gold-300/70 bg-gradient-to-r from-rose-100 to-gold-100 px-4 py-3 text-center font-display text-xs tracking-[0.12em] text-gold-700 transition-colors active:from-rose-200 active:to-gold-200"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
