"use client"

import { useEffect, useState } from "react"

/**
 * 画像を全部サムネイルで並べ、タップで画面いっぱいのライトボックス表示。
 * 背景タップ / × / Esc で閉じる。
 */
export default function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState<string | null>(null)
  const imgs = images.filter((s) => typeof s === "string" && s.length > 0)

  if (imgs.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {imgs.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(src)}
            aria-label={`画像 ${i + 1} を拡大`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gold-200/70 bg-gold-50/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`画像 ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && <Lightbox src={active} onClose={() => setActive(null)} />}
    </>
  )
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="画像拡大表示"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="閉じる"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-[#3a2540] shadow-lg transition-colors hover:bg-white"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
