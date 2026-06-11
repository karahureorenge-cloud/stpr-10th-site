"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

/**
 * 画像を全部サムネイルで並べるギャラリー。
 * - サムネは元画像のアスペクト比を維持（width:100% / height:auto）、masonry 風の段組み。
 * - タップで画面いっぱいのライトボックス表示（クリックした画像が開く）。
 * - ライトボックスは document.body へ Portal するため、backdrop-filter や
 *   overflow-hidden を持つ祖先（アコーディオン等）に閉じ込められず全画面で開く。
 * - × / 背景タップ / Esc で閉じる。
 */
export default function ImageGallery({
  images,
  columnsClassName = "columns-2 gap-2 sm:columns-3 md:columns-4",
}: {
  images: string[]
  /** masonry の段組みクラス。読ませたい説明画像は少ない列数を渡す。 */
  columnsClassName?: string
}) {
  const imgs = images.filter((s) => typeof s === "string" && s.length > 0)
  const [active, setActive] = useState<string | null>(null)

  if (imgs.length === 0) return null

  return (
    <>
      <div className={columnsClassName}>
        {imgs.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(src)}
            aria-label={`画像 ${i + 1} を拡大`}
            className="mb-2 block w-full break-inside-avoid overflow-hidden rounded-lg border border-gold-200/70 bg-gold-50/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`画像 ${i + 1}`} className="block h-auto w-full" />
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

  // Lightbox はクリック後（クライアント）にのみ描画されるため document は常に存在。
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-4"
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
    </div>,
    document.body,
  )
}
