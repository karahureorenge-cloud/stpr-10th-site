/**
 * すとぷりサンドボックス v3 装飾コンポーネント。
 * コンセプト「白・光・透過・余白」。
 * v2 までで使っていた 17 種の装飾 SVG（CastleSilhouette / Cloud / Candy /
 * CupCake / Ribbon / TeaCup / Stripe / WaveLine / HeartLine / HeartShape /
 * RainbowText / RoseCorsage / ClockMotif / Feather / CrownIcon / WingPair /
 * DotPattern）は全部破棄。
 *
 * 残すのは Sparkle と LightDot の 2 つ。
 * v3.1 で「アクセント」として MiniHeart / MiniRibbon を最小単位で復活。
 * 大量に並べず、1箇所につき 1〜2 個までの運用とする。
 */

import type { CSSProperties } from 'react'

type SparkleColor = 'white' | 'pink' | 'gold'

const SPARKLE_COLOR_MAP: Record<SparkleColor, string> = {
  white: 'rgba(255, 255, 255, 0.95)',
  pink:  'rgba(232, 160, 188, 0.85)',
  gold:  'rgba(232, 212, 163, 0.9)',
}

/* =========================================================================
 * Sparkle — 4 方向に伸びる細い光の星粒
 *   中心から 4 本（縦・横）+ 4 本（斜め）の 8 本線。
 *   呼吸アニメーションで明滅する。
 * ========================================================================= */
export function Sparkle({
  size = 12,
  color = 'white',
  delay = 0,
  className = '',
  style,
}: {
  size?: number
  color?: SparkleColor
  delay?: number
  className?: string
  style?: CSSProperties
}) {
  const fill = SPARKLE_COLOR_MAP[color]
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={`sp-breath ${className}`}
      style={{
        animationDelay: `${delay}s`,
        filter: `drop-shadow(0 0 ${Math.max(2, size / 4)}px ${fill})`,
        ...style,
      }}
    >
      {/* 縦横の細い 4 本線 */}
      <path
        d="M 12 1 L 12 23 M 1 12 L 23 12"
        stroke={fill}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* 斜め 4 本線（短め） */}
      <path
        d="M 5 5 L 9 9 M 19 5 L 15 9 M 5 19 L 9 15 M 19 19 L 15 15"
        stroke={fill}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* 中央のドット */}
      <circle cx="12" cy="12" r="1.4" fill={fill} />
    </svg>
  )
}

/* =========================================================================
 * LightDot — ふわっと光る大きめの円
 *   blur(20px) を当てて、空気に光が滲んでいるように見せる。
 *   親に position: relative を要求、本体は absolute 配置前提。
 * ========================================================================= */
export function LightDot({
  size = 80,
  color = 'rgba(255, 230, 238, 0.6)',
  opacity = 0.4,
  blur = 20,
  className = '',
  style,
}: {
  size?: number
  color?: string
  opacity?: number
  blur?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        opacity,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

/* =========================================================================
 * MiniHeart（v3.1 追加）
 *   とても小さなハート。アクセント用、1箇所に 1〜2 個まで。
 *   color は preset 名（pink / strawberry / white / gold）または任意の CSS 色。
 * ========================================================================= */
const MINI_HEART_PRESETS: Record<string, string> = {
  pink:       'var(--sp-pink-candy)',
  strawberry: 'var(--sp-pink-strawberry)',
  white:      'rgba(255, 255, 255, 0.95)',
  gold:       'var(--sp-gold-deep)',
}

export function MiniHeart({
  size = 12,
  color = 'pink',
  delay = 0,
  breathe = true,
  className = '',
  style,
}: {
  size?: number
  color?: string
  delay?: number
  breathe?: boolean
  className?: string
  style?: CSSProperties
}) {
  const fill = MINI_HEART_PRESETS[color] ?? color
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={`${breathe ? 'sp-breath' : ''} ${className}`}
      style={{
        animationDelay: `${delay}s`,
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: `drop-shadow(0 1px 2px rgba(245, 134, 164, 0.35))`,
        ...style,
      }}
    >
      <path
        d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
        fill={fill}
      />
    </svg>
  )
}

/* =========================================================================
 * StarBurst（v3.2 追加）
 *   8 方向に伸びる星型。Sparkle より「☆」寄りの質感。
 *   スタンプ隅・タイトル隣のアクセント用。1 箇所 1 個まで。
 * ========================================================================= */
export function StarBurst({
  size = 14,
  color = 'pink',
  delay = 0,
  className = '',
  style,
}: {
  size?: number
  color?: string
  delay?: number
  className?: string
  style?: CSSProperties
}) {
  const fill = MINI_HEART_PRESETS[color] ?? color
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={`sp-breath ${className}`}
      style={{
        animationDelay: `${delay}s`,
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: `drop-shadow(0 1px 2px rgba(245, 134, 164, 0.35))`,
        ...style,
      }}
    >
      <g fill={fill}>
        {/* 縦横の 4 方向に伸びる主星 */}
        <polygon points="12,1 13,11 23,12 13,13 12,23 11,13 1,12 11,11" />
        {/* 斜め 45° の補助星（控えめに） */}
        <g transform="rotate(45 12 12)">
          <polygon
            points="12,3 12.7,11.3 21,12 12.7,12.7 12,21 11.3,12.7 3,12 11.3,11.3"
            opacity="0.55"
          />
        </g>
      </g>
    </svg>
  )
}

/* =========================================================================
 * FanComment（v3.4 追加）
 *   小さな白い吹き出し（左下が尖る）。HERO の光粒 + MEMBER の隅などに最大 3 個。
 *   font-family は呼び出し側で zenMaru を当てる（className 経由）。
 * ========================================================================= */
export function FanComment({
  text,
  className = '',
  style,
}: {
  text: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden
      className={`sp-fan-comment ${className}`}
      style={style}
    >
      {text}
    </span>
  )
}

/* =========================================================================
 * Confetti（v3.4 追加）
 *   斜めに漂う小三角片。HERO のキラ粒に紛れ込ませる、最大 3 個。
 *   --sp-conf-rot で初期回転を指定（@keyframes sp-confetti-twirl が継承）。
 * ========================================================================= */
export function Confetti({
  size = 10,
  color = 'var(--sp-pink-candy)',
  rotate = 0,
  className = '',
  style,
}: {
  size?: number
  color?: string
  rotate?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={Math.round(size * 0.83)}
      aria-hidden
      className={`sp-confetti ${className}`}
      style={
        {
          ['--sp-conf-rot' as string]: `${rotate}deg`,
          ...style,
        } as CSSProperties
      }
    >
      <polygon points="0,0 12,0 6,10" fill={color} />
    </svg>
  )
}

/* =========================================================================
 * MiniRibbon（v3.1 追加）
 *   とても小さなリボン。セクション境界の細い線中央に置く程度の使い方。
 * ========================================================================= */
export function MiniRibbon({
  size = 16,
  color = 'pink',
  delay = 0,
  className = '',
  style,
}: {
  size?: number
  color?: string
  delay?: number
  className?: string
  style?: CSSProperties
}) {
  const fill = MINI_HEART_PRESETS[color] ?? color
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={`sp-breath ${className}`}
      style={{
        animationDelay: `${delay}s`,
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: `drop-shadow(0 1px 2px rgba(245, 134, 164, 0.3))`,
        ...style,
      }}
    >
      {/* 左羽根 */}
      <path
        d="M12 13 C 8 9, 3 9, 3 13 C 3 16, 6 17, 8 16 L 12 13 Z"
        fill={fill}
        opacity="0.95"
      />
      {/* 右羽根 */}
      <path
        d="M12 13 C 16 9, 21 9, 21 13 C 21 16, 18 17, 16 16 L 12 13 Z"
        fill={fill}
        opacity="0.95"
      />
      {/* 中央結び目 */}
      <ellipse cx="12" cy="13" rx="1.6" ry="2" fill={fill} />
    </svg>
  )
}
