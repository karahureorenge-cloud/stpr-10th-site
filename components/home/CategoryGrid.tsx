"use client"

import { T } from "@/lib/theme"

type Category = {
  id: string
  label: string
  ja: string
}

// 全カード同サイズの 4 列グリッド。並び順は表示レイアウトに準拠。
// [ LIVE ][ GOODS ][ EVENT ][ MUSIC ]
// [ ALBUM ][ MAGAZINE ][ MEDIA ][ MEMBERS ]
const CATEGORIES: Category[] = [
  { id: "live", label: "LIVE", ja: "ライブ" },
  { id: "goods", label: "GOODS", ja: "グッズ" },
  { id: "event", label: "EVENT", ja: "イベント" },
  { id: "music", label: "MUSIC", ja: "ミュージック" },
  { id: "album", label: "ALBUM", ja: "アルバム" },
  { id: "magazine", label: "MAGAZINE", ja: "雑誌" },
  { id: "media", label: "MEDIA", ja: "メディア" },
  { id: "members", label: "MEMBERS", ja: "メンバー" },
]

/**
 * トップのカテゴリグリッド。各セクション（同一ページのアンカー）への入り口。
 * 全カード同サイズ。SP/タブレット 2 列、PC 4 列。高さは 120px 固定。
 */
export default function CategoryGrid() {
  return (
    <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-4 px-5 md:grid-cols-4">
      {CATEGORIES.map((c) => (
        <a
          key={c.id}
          href={`#${c.id}`}
          className="flex h-[120px] flex-col items-center justify-center rounded-[20px] p-4 no-underline"
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
            className="text-[16px] font-semibold"
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
            className="text-[12px]"
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
        </a>
      ))}
    </div>
  )
}
