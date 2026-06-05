"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

const BASE = "/stpr-10th-anniversary"

/**
 * 画面右下に固定表示する検索ボタン + 検索モーダル。
 * - PC・SP 両方で表示。SP ではハンバーガー（BottomNav）の上に重ねる。
 * - ボタンタップでモーダルを開き、入力して検索ボタン or Enter で
 *   /stpr-10th-anniversary/search?q=... へ遷移する。
 * - 配色はサイトに合わせたピンク・ゴールド系。
 */
export default function FloatingSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // モーダル表示中は背景スクロールを抑止し、Esc で閉じる。開いたら入力にフォーカス。
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    setOpen(false)
    router.push(term ? `${BASE}/search?q=${encodeURIComponent(term)}` : `${BASE}/search`)
  }

  return (
    <>
      {/* 検索ボタン（右下固定）。SP はハンバーガーの上、PC は右下。 */}
      <button
        type="button"
        aria-label="サイト内検索を開く"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed bottom-[5.5rem] right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/70 bg-gradient-to-br from-rose-200 to-gold-300 text-gold-700 shadow-lg transition-transform active:scale-95 md:bottom-5"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {/* 検索モーダル */}
      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-24 sm:pt-32"
          role="dialog"
          aria-modal="true"
          aria-label="サイト内検索"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-[#3a2540]/40 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl border border-gold-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm tracking-[0.18em] text-gold-700">SEARCH</p>
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#9a8aa0] transition-colors hover:bg-gold-50 hover:text-gold-600"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6 L18 18 M18 6 L6 18" />
                </svg>
              </button>
            </div>

            <form onSubmit={submit} role="search" className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-gold-200 bg-white/80 px-4 py-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-gold-500"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  name="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ライブ・グッズ・楽曲などを検索…"
                  aria-label="サイト内検索"
                  className="w-full min-w-0 bg-transparent text-sm text-[#3a2540] outline-none placeholder:text-[#b8a8be]"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gradient-to-br from-rose-300 to-gold-400 px-5 py-2 text-sm font-bold text-white shadow-sm transition-transform active:scale-95"
              >
                検索
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
