"use client"

import { useEffect, useState } from "react"

// ローマ数字（12時位置から時計回り）。
const ROMAN = [
  "XII",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
]

/**
 * リアルタイム時計盤。
 * - ローマ数字の文字盤
 * - 星の針（時針・分針）と三日月モチーフ
 * マウント後にのみ針を描画し、ハイドレーション不一致を避ける。
 */
export default function HeroClock() {
  const [now, setNow] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  // マウント後にのみ時刻を反映し、針・文字盤（三角関数）を描画する。
  // Math.cos/sin の値はサーバー(Node)とブラウザで末尾桁が異なりうるため、
  // SSR では計算結果を出さず静的プレースホルダーにしてハイドレーション不一致を避ける。
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>
    // 同期的な setState を避けるため、タイマーのコールバック内で状態を更新する。
    const startId = setTimeout(() => {
      setMounted(true)
      setNow(new Date())
      intervalId = setInterval(() => setNow(new Date()), 1000)
    }, 0)
    return () => {
      clearTimeout(startId)
      clearInterval(intervalId)
    }
  }, [])

  // マウント前（= SSR / 初回クライアントレンダー）は静的プレースホルダー。
  if (!mounted) return <ClockPlaceholder />

  // 各針の回転角（度）。null 時は 0 で静止表示。
  const sec = now ? now.getSeconds() : 0
  const min = now ? now.getMinutes() : 0
  const hour = now ? now.getHours() % 12 : 0

  const secDeg = sec * 6
  const minDeg = min * 6 + sec * 0.1
  const hourDeg = hour * 30 + min * 0.5

  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      role="img"
      aria-label="10周年の時計盤"
    >
      <defs>
        <radialGradient id="clockFace" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#FDF4F0" />
        </radialGradient>
        <linearGradient id="clockRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5E6B8" />
          <stop offset="50%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#A07830" />
        </linearGradient>
        <linearGradient id="handGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A07830" />
          <stop offset="100%" stopColor="#D4A853" />
        </linearGradient>
      </defs>

      {/* 外周リング */}
      <circle cx="100" cy="100" r="95" fill="url(#clockRim)" />
      <circle cx="100" cy="100" r="86" fill="url(#clockFace)" />
      <circle
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke="#D4A853"
        strokeWidth="0.5"
        opacity="0.6"
      />

      {/* ローマ数字 */}
      {ROMAN.map((r, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const x = 100 + Math.cos(angle) * 70
        const y = 100 + Math.sin(angle) * 70
        return (
          <text
            key={r}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize="11"
            fontWeight="600"
            fill="#A07830"
          >
            {r}
          </text>
        )
      })}

      {/* 三日月モチーフ（中央上） */}
      <path
        d="M100 40 a14 14 0 1 0 8 25 a11 11 0 1 1 -8 -25 Z"
        fill="#F5E6B8"
        opacity="0.9"
      />

      {/* 時針（星付き） */}
      <g transform={`rotate(${hourDeg} 100 100)`}>
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="55"
          stroke="url(#handGrad)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Star cx={100} cy={52} r={5} fill="#D4A853" />
      </g>

      {/* 分針（星付き） */}
      <g transform={`rotate(${minDeg} 100 100)`}>
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="38"
          stroke="url(#handGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Star cx={100} cy={35} r={4} fill="#F472B6" />
      </g>

      {/* 秒針 */}
      <g transform={`rotate(${secDeg} 100 100)`}>
        <line
          x1="100"
          y1="108"
          x2="100"
          y2="30"
          stroke="#F472B6"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>

      {/* 中心 */}
      <circle cx="100" cy="100" r="4" fill="#A07830" />
      <circle cx="100" cy="100" r="1.5" fill="#FFFDF7" />
    </svg>
  )
}

/**
 * マウント前の静的プレースホルダー。
 * 三角関数を一切使わず、外周リング・文字盤・中心と 12時位置の針だけを
 * 固定座標で描く（SSR とクライアントで完全一致する）。
 */
function ClockPlaceholder() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      role="img"
      aria-label="10周年の時計盤"
    >
      <defs>
        <radialGradient id="clockFace" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#FDF4F0" />
        </radialGradient>
        <linearGradient id="clockRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5E6B8" />
          <stop offset="50%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#A07830" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="95" fill="url(#clockRim)" />
      <circle cx="100" cy="100" r="86" fill="url(#clockFace)" />
      <circle
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke="#D4A853"
        strokeWidth="0.5"
        opacity="0.6"
      />

      {/* 三日月モチーフ（中央上・固定座標） */}
      <path
        d="M100 40 a14 14 0 1 0 8 25 a11 11 0 1 1 -8 -25 Z"
        fill="#F5E6B8"
        opacity="0.9"
      />

      {/* 12時位置の針（固定） */}
      <line
        x1="100"
        y1="100"
        x2="100"
        y2="55"
        stroke="#D4A853"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="100" cy="100" r="4" fill="#A07830" />
      <circle cx="100" cy="100" r="1.5" fill="#FFFDF7" />
    </svg>
  )
}

// 5点星
function Star({
  cx,
  cy,
  r,
  fill,
}: {
  cx: number
  cy: number
  r: number
  fill: string
}) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r / 2.4
    const angle = (i * 36 - 90) * (Math.PI / 180)
    pts.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`)
  }
  return <polygon points={pts.join(" ")} fill={fill} />
}
