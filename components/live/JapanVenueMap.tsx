"use client"

import { useEffect, useState } from "react"
import { JAPAN_MAP_PATHS } from "./japan-map-paths"
import { VENUE_COLORS } from "./venue-colors"

export type VenueMapItem = {
  name: string
  prefecture?: string
  dateLabel?: string
}

const COLORS = VENUE_COLORS

// 都道府県 → 経度・緯度（県庁所在地のおおよそ）。
const PREF_LONLAT: Record<string, [number, number]> = {
  北海道: [141.35, 43.06], 青森: [140.74, 40.82], 岩手: [141.15, 39.7], 宮城: [140.87, 38.27],
  秋田: [140.1, 39.72], 山形: [140.36, 38.24], 福島: [140.47, 37.75],
  茨城: [140.45, 36.34], 栃木: [139.88, 36.57], 群馬: [139.06, 36.39], 埼玉: [139.65, 35.86],
  千葉: [140.12, 35.61], 東京: [139.69, 35.69], 神奈川: [139.64, 35.45],
  新潟: [139.02, 37.9], 富山: [137.21, 36.7], 石川: [136.63, 36.59], 福井: [136.22, 36.07],
  山梨: [138.57, 35.66], 長野: [138.18, 36.65], 岐阜: [136.72, 35.39], 静岡: [138.38, 34.98],
  愛知: [136.91, 35.18], 三重: [136.51, 34.73],
  滋賀: [135.87, 35.0], 京都: [135.76, 35.02], 大阪: [135.5, 34.69], 兵庫: [135.18, 34.69],
  奈良: [135.83, 34.69], 和歌山: [135.17, 34.23],
  鳥取: [134.24, 35.5], 島根: [133.05, 35.47], 岡山: [133.93, 34.66], 広島: [132.46, 34.4], 山口: [131.47, 34.19],
  徳島: [134.56, 34.07], 香川: [134.04, 34.34], 愛媛: [132.77, 33.84], 高知: [133.53, 33.56],
  福岡: [130.42, 33.61], 佐賀: [130.3, 33.25], 長崎: [129.87, 32.74], 熊本: [130.74, 32.79],
  大分: [131.61, 33.24], 宮崎: [131.42, 31.91], 鹿児島: [130.56, 31.56], 沖縄: [127.68, 26.21],
}

// live-map-mockup.html のピン3点から導いた線形射影（ピン頭の中心座標）。
function pinPos(prefecture?: string): { x: number; y: number } | null {
  if (!prefecture) return null
  const ll = PREF_LONLAT[prefecture] ?? PREF_LONLAT[prefecture.replace(/[都道府県]$/, "")]
  if (!ll) return null
  if (ll === PREF_LONLAT["沖縄"]) return { x: 60, y: 470 } // 沖縄はインセット位置
  const x = Math.max(16, Math.min(384, 23.571 * ll[0] - 3041.43))
  const y = Math.max(24, Math.min(470, -31 * ll[1] + 1405.7))
  return { x, y }
}

/** 日本地図＋会場ピン。リスト/ピンのクリックで該当会場（#venue-{i}）へスクロール。 */
export default function JapanVenueMap({ venues }: { venues: VenueMapItem[] }) {
  const [active, setActive] = useState(0)

  const goto = (i: number) => {
    setActive(i)
    document.getElementById(`venue-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // スクロールに応じてアクティブを更新。
  useEffect(() => {
    const els = venues
      .map((_, i) => document.getElementById(`venue-${i}`))
      .filter((el): el is HTMLElement => !!el)
    if (els.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number(e.target.id.replace("venue-", ""))
            if (!Number.isNaN(i)) setActive(i)
          }
        }
      },
      { threshold: 0.3 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [venues])

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px]">
        {/* 会場リスト */}
        <div className="flex flex-col justify-center gap-1.5 border-b border-gray-200 p-5 md:border-b-0 md:border-r">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
            SCHEDULE &amp; PLACE
          </p>
          {venues.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goto(i)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                i === active
                  ? "border-accent-200 bg-accent-50"
                  : "border-transparent hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-gray-800">{v.name}</span>
                {(v.prefecture || v.dateLabel) && (
                  <span className="block truncate text-xs text-gray-500">
                    {[v.prefecture, v.dateLabel].filter(Boolean).join(" / ")}
                  </span>
                )}
              </span>
              <span className="ml-auto text-xs text-gray-400">↓</span>
            </button>
          ))}
        </div>

        {/* 日本地図 */}
        <div className="flex items-center justify-center bg-gray-50 p-4">
          <svg viewBox="0 0 400 500" className="h-auto w-full max-w-[320px]" xmlns="http://www.w3.org/2000/svg">
            <g
              fill="#d1d5db"
              stroke="#fff"
              strokeWidth={0.8}
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: JAPAN_MAP_PATHS }}
            />
            {venues.map((v, i) => {
              const pos = pinPos(v.prefecture)
              if (!pos) return null
              const color = COLORS[i % COLORS.length]
              const { x, y } = pos
              const isActive = i === active
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  style={{
                    transformOrigin: "center",
                    transform: isActive ? "scale(1.25)" : undefined,
                    transformBox: "fill-box",
                  }}
                  onClick={() => goto(i)}
                >
                  <title>{[v.name, v.prefecture].filter(Boolean).join(" / ")}</title>
                  <circle cx={x} cy={y + 10} r={16} fill={color} opacity={isActive ? 0.25 : 0.15} />
                  <path
                    d={`M${x},${y - 12} C${x - 6},${y - 12} ${x - 11},${y - 7} ${x - 11},${y} C${x - 11},${y + 9} ${x},${y + 20} ${x},${y + 20} C${x},${y + 20} ${x + 11},${y + 9} ${x + 11},${y} C${x + 11},${y - 7} ${x + 6},${y - 12} ${x},${y - 12} Z`}
                    fill={color}
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                  <circle cx={x} cy={y} r={4.5} fill="#fff" />
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
