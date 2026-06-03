"use client"

import Link from "next/link"
import { T } from "@/lib/theme"

const BASE = "/stpr-10th-anniversary"

type Size = "large" | "medium" | "small"

type Category = {
  id: string
  label: string
  ja: string
  size: Size
}

// ベントーグリッド用の定義。PC では large=2x2 / medium=1x1 / small=1x1。
const CATEGORIES: Category[] = [
  { id: "live", label: "LIVE", ja: "ライブ", size: "large" },
  { id: "event", label: "EVENT", ja: "イベント", size: "medium" },
  { id: "goods", label: "GOODS", ja: "グッズ", size: "medium" },
  { id: "members", label: "MEMBERS", ja: "メンバー", size: "large" },
  { id: "music", label: "MUSIC", ja: "ミュージック", size: "medium" },
  { id: "album", label: "ALBUM", ja: "アルバム", size: "small" },
  { id: "magazine", label: "MAGAZINE", ja: "雑誌", size: "small" },
  { id: "media", label: "MEDIA", ja: "メディア", size: "small" },
]

// サイズ別のレイアウト。SP（〜767px）は 2 列・全カード同サイズ。
// md 以上でのみ span / 余白 / 最小高 / フォントを切り替えてベントー化する。
const SIZE_CLASS: Record<Size, string> = {
  large: "md:col-span-2 md:row-span-2 md:min-h-[240px] md:p-12",
  medium: "md:min-h-[120px] md:p-8",
  small: "md:min-h-[90px] md:p-6",
}
const LABEL_CLASS: Record<Size, string> = {
  large: "text-[15px] md:text-[22px]",
  medium: "text-[15px] md:text-[16px]",
  small: "text-[13px]",
}
const JA_CLASS: Record<Size, string> = {
  large: "text-[12px] md:text-[14px]",
  medium: "text-[12px]",
  small: "text-[12px]",
}

/** トップのカテゴリグリッド（ベントーレイアウト）。各ページへの入り口。 */
export default function CategoryGrid() {
  return (
    <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-4 px-5 md:grid-cols-3">
      {CATEGORIES.map((c) => (
        <Link
          key={c.id}
          href={`${BASE}/${c.id}`}
          className={`flex min-h-[110px] flex-col items-center justify-center rounded-[20px] p-6 no-underline ${SIZE_CLASS[c.size]}`}
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(212,168,83,0.3)",
            boxShadow: "0 4px 20px rgba(212,168,83,0.08)",
            transition: "transform 0.25s, box-shadow 0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)"
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(212,168,83,0.18)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ""
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,168,83,0.08)"
          }}
        >
          {/* 英語ラベル */}
          <span
            className={`font-semibold ${LABEL_CLASS[c.size]}`}
            style={{
              fontFamily: "var(--font-cinzel), serif",
              letterSpacing: "0.2em",
              color: T.goldD,
              marginBottom: "6px",
            }}
          >
            {c.label}
          </span>

          {/* 日本語ラベル */}
          <span
            className={JA_CLASS[c.size]}
            style={{
              fontFamily: "var(--font-noto-serif-jp), serif",
              color: T.muted,
              letterSpacing: "0.1em",
            }}
          >
            {c.ja}
          </span>

          {/* ゴールドの細いライン（下部装飾） */}
          <span
            aria-hidden
            style={{
              marginTop: "12px",
              width: "30px",
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
            }}
          />
        </Link>
      ))}
    </div>
  )
}
