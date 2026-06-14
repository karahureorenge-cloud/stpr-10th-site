"use client"

import { useState } from "react"

// 外部リンクは本家ファンサイト（stprinformalfansite.com）。ライブは本サイトの /live。
// ※「とぅるりぷ」のリンクは未提供のため仮（#）。
const FAN = "https://www.stprinformalfansite.com"
const GROUP_LINKS: { label: string; href: string }[] = [
  { label: "STPR Family", href: `${FAN}/stpr-family` },
  { label: "すとぷり", href: `${FAN}/stpr` },
  { label: "騎士X", href: `${FAN}/knightax` },
  { label: "AMPTAK", href: `${FAN}/amptak` },
  { label: "めておら", href: `${FAN}/meteorites` },
  { label: "すにすて", href: `${FAN}/sneakerstep` },
  { label: "とぅるりぷ", href: `${FAN}/true-lip` },
]
const SECTION_LINKS: { label: string; href: string }[] = [
  { label: "STPRを初めてみる方へ", href: `${FAN}/stpr-for-beginners` },
  { label: "ユニット", href: `${FAN}/%E3%83%A6%E3%83%8B%E3%83%83%E3%83%88` },
  { label: "ライブ", href: `${FAN}/live` },
  { label: "イベント", href: `${FAN}/%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88` },
  { label: "グッズ", href: `${FAN}/%E3%82%B0%E3%83%83%E3%82%BA` },
  { label: "素材", href: `${FAN}/sozai` },
]

const NAVY = "#1a347e"

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="whitespace-nowrap text-[15px] font-bold text-[#1a347e] transition-colors hover:text-[#e85298]"
    >
      {label}
    </a>
  )
}

function Logo() {
  return (
    <a href="/live" className="block shrink-0 leading-none">
      <span className="flex items-center justify-center gap-1 text-[11px] font-extrabold tracking-[0.18em]">
        <span className="text-[#f5c33b]">✦</span>
        <span className="text-[#ec4899]">非公式</span>
        <span className="text-[#f5c33b]">✦</span>
      </span>
      <span className="mt-0.5 flex items-baseline">
        <span className="text-[27px] font-black tracking-tight text-[#1b97e0] md:text-[33px]">
          STPR<span className="text-[#ec4899]">.</span>
        </span>
        <span className="text-[20px] font-black tracking-tight md:text-[24px]">
          <span className="text-[#ec4899]">ファン</span>
          <span className="text-[#1b97e0]">サイト</span>
        </span>
      </span>
    </a>
  )
}

/** 公開 /live ページ専用ヘッダー。白背景・ロゴ＋2段ナビ。スマホはハンバーガー。 */
export default function LiveHeader() {
  const [open, setOpen] = useState(false)
  const allLinks = [...GROUP_LINKS, ...SECTION_LINKS]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <div className="flex items-center justify-between gap-6 py-3">
          <Logo />

          {/* PC ナビ（2段） */}
          <nav className="hidden flex-col items-end gap-1.5 md:flex">
            <div className="flex flex-wrap justify-end gap-x-6 gap-y-1">
              {GROUP_LINKS.map((l) => (
                <NavLink key={l.label} {...l} />
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-x-6 gap-y-1">
              {SECTION_LINKS.map((l) => (
                <NavLink key={l.label} {...l} />
              ))}
            </div>
          </nav>

          {/* ハンバーガー（SP） */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="メニュー"
            className="flex h-10 w-10 items-center justify-center rounded text-[#1a347e] md:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" strokeLinecap="round" />
                  <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
                  <line x1="4" y1="17" x2="20" y2="17" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* SP メニュー */}
      {open && (
        <nav className="grid grid-cols-2 gap-x-4 border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          {allLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-bold text-[#1a347e] transition-colors hover:text-[#e85298]"
              style={{ color: NAVY }}
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
