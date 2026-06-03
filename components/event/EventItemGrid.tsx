"use client"

import { useEffect, useState } from "react"

export type EventGridItem = {
  title?: string
  images: string[]
  /** 補助テキスト行（販売期間など） */
  meta?: string[]
  description?: string
  info?: string
  linkUrl?: string
  linkLabel?: string
}

/**
 * メニュー・特典 / グッズ販売 用の表示。
 * - 各アイテムの画像を「全部」小さいサムネイルで並べる（省略なし）。
 * - サムネイルをタップ/クリックで画面いっぱいのライトボックス表示。
 *   背景タップ・×ボタン・Esc で閉じる。
 */
export default function EventItemGrid({ items }: { items: EventGridItem[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (items.length === 0) return null

  return (
    <>
      <div className="flex flex-col gap-5">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gold-100/70 bg-white/40 p-4"
          >
            {it.title && (
              <h3 className="mb-2 font-serif text-base font-bold text-[#3a2540]">
                {it.title}
              </h3>
            )}

            {/* 全画像を小さいサムネイルで並べる（省略しない） */}
            {it.images.length > 0 && (
              <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {it.images.map((src, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setLightbox(src)}
                    aria-label={`${it.title ?? "画像"} ${j + 1} を拡大`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gold-200/70 bg-gold-50/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${it.title ?? "画像"} ${j + 1}`}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            )}

            {it.meta && it.meta.length > 0 && (
              <div className="space-y-0.5 text-sm text-[#6a5570]">
                {it.meta.map((m, k) => (
                  <p key={k}>{m}</p>
                ))}
              </div>
            )}
            {it.description && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-[#6a5570]">
                {it.description}
              </p>
            )}
            {it.info && (
              <p className="mt-1 whitespace-pre-wrap text-xs text-[#9a8aa0]">{it.info}</p>
            )}
            {it.linkUrl && (
              <a
                href={it.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-xl bg-gold-400 px-4 py-2 text-xs text-white transition-colors hover:bg-gold-500"
              >
                {it.linkLabel ?? "リンク"} →
              </a>
            )}
          </div>
        ))}
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  )
}

/** 画面いっぱいのライトボックス（背景タップ / × / Esc で閉じる）。 */
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
