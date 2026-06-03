import Image from "next/image"
import { T, MEMBER_COLORS } from "@/lib/theme"

// 花びらパーティクルの配置（決定的な値でハイドレーション不一致を回避）。控えめに9個。
const PETALS = [
  { left: "6%", delay: "0s", duration: "15s", size: 13 },
  { left: "17%", delay: "3s", duration: "18s", size: 10 },
  { left: "29%", delay: "6s", duration: "16s", size: 15 },
  { left: "42%", delay: "1.5s", duration: "20s", size: 11 },
  { left: "55%", delay: "4.5s", duration: "17s", size: 9 },
  { left: "67%", delay: "2s", duration: "19s", size: 14 },
  { left: "78%", delay: "5.5s", duration: "14s", size: 11 },
  { left: "88%", delay: "7s", duration: "18s", size: 13 },
  { left: "95%", delay: "3.5s", duration: "16s", size: 10 },
]

// 星のきらめき配置（20個・決定的座標）。
const STARS = [
  { top: "9%", left: "11%", delay: "0s", r: 2.5 },
  { top: "14%", left: "78%", delay: "0.6s", r: 3 },
  { top: "21%", left: "30%", delay: "1.2s", r: 2 },
  { top: "12%", left: "55%", delay: "0.9s", r: 2.4 },
  { top: "27%", left: "88%", delay: "1.6s", r: 2 },
  { top: "33%", left: "8%", delay: "0.3s", r: 3 },
  { top: "38%", left: "64%", delay: "2s", r: 2.2 },
  { top: "44%", left: "20%", delay: "1.1s", r: 2.6 },
  { top: "18%", left: "42%", delay: "2.4s", r: 1.8 },
  { top: "52%", left: "82%", delay: "0.5s", r: 2.3 },
  { top: "58%", left: "14%", delay: "1.8s", r: 2.7 },
  { top: "63%", left: "48%", delay: "0.8s", r: 2 },
  { top: "69%", left: "73%", delay: "2.2s", r: 2.4 },
  { top: "74%", left: "26%", delay: "1.4s", r: 2 },
  { top: "78%", left: "90%", delay: "0.2s", r: 2.6 },
  { top: "83%", left: "6%", delay: "1.9s", r: 2.2 },
  { top: "86%", left: "58%", delay: "0.7s", r: 2.8 },
  { top: "90%", left: "37%", delay: "1.3s", r: 2 },
  { top: "47%", left: "95%", delay: "2.6s", r: 1.8 },
  { top: "55%", left: "38%", delay: "1s", r: 2.3 },
]

// アーチ上部に散らすバラのドット（左右7輪ずつ・決定的座標）。
// メンバーカラー6色を順に割り当て、x座標は左右対称気味に。
const ARCH_FLOWERS = [
  // 左側の柱〜アーチ肩
  { cx: 60, cy: 200 },
  { cx: 70, cy: 150 },
  { cx: 95, cy: 110 },
  { cx: 140, cy: 75 },
  { cx: 210, cy: 52 },
  { cx: 300, cy: 42 },
  { cx: 400, cy: 40 },
  // 中央〜右側の肩〜柱
  { cx: 800, cy: 40 },
  { cx: 900, cy: 42 },
  { cx: 990, cy: 52 },
  { cx: 1060, cy: 75 },
  { cx: 1105, cy: 110 },
  { cx: 1130, cy: 150 },
  { cx: 1140, cy: 200 },
]

/**
 * トップの HERO。
 * - Layer1: ピンク→ラベンダー→スカイのグラデーション背景
 * - Layer2: うっすら時計塔シルエット（静止・opacity 0.08）
 * - Layer3: 花のアーチ（柱ライン + バラのドット）
 * - 主役: 10周年ロゴ（next/image）
 * - 期間テキスト / キャッチコピー / スクロール誘導
 * - 花びらパーティクル / 星のきらめき（CSS アニメーション）
 *
 * 時計（HeroClock）は廃止。アニメーションは fadeUp / twinkle / floatPetal /
 * scrollLine のみで、激しい常時回転系は使わない。
 */
export default function HeroSection() {
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
      {/* Layer1: グラデーション背景 */}
      <div
        className="absolute inset-0 -z-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(251,207,232,0.5) 0%, transparent 50%)," +
            "radial-gradient(ellipse at 70% 80%, rgba(196,181,253,0.4) 0%, transparent 50%)," +
            "radial-gradient(ellipse at 50% 50%, rgba(186,230,253,0.3) 0%, transparent 60%)," +
            "linear-gradient(160deg, #FFF8FB 0%, #FDE8F4 35%, #EDE8FD 65%, #E8F4FD 100%)",
        }}
      />

      {/* Layer2: うっすら時計塔シルエット（静止・中央背面） */}
      <svg
        viewBox="0 0 200 200"
        width={500}
        height={500}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: 0.08, color: T.goldD }}
      >
        {/* 外周リング */}
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
        {/* 時刻目盛り */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180)
          const x1 = 100 + Math.cos(a) * 80
          const y1 = 100 + Math.sin(a) * 80
          const x2 = 100 + Math.cos(a) * 72
          const y2 = 100 + Math.sin(a) * 72
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )
        })}
        {/* 固定の針（10時10分風） */}
        <line x1="100" y1="100" x2="64" y2="74" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="100" x2="136" y2="74" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="100" r="5" fill="currentColor" />
      </svg>

      {/* Layer3: 花のアーチ（柱ライン + バラのドット） */}
      <svg
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full w-full"
        style={{ opacity: 0.35 }}
      >
        {/* 左右の柱 + アーチ曲線 */}
        <path
          d="M60 400 V170 Q60 60 250 50 Q600 30 950 50 Q1140 60 1140 170 V400"
          fill="none"
          stroke={T.goldL}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* アーチ上部のバラ（メンバーカラー6色を循環） */}
        {ARCH_FLOWERS.map((f, i) => {
          const color = MEMBER_COLORS[i % MEMBER_COLORS.length]
          return (
            <g key={i}>
              <circle cx={f.cx} cy={f.cy} r="12" fill={color} opacity="0.7" />
              <circle cx={f.cx} cy={f.cy} r="5" fill={T.goldL} />
            </g>
          )
        })}
      </svg>

      {/* 花びらパーティクル（HERO 内に閉じ込め・absolute） */}
      <div className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden" aria-hidden>
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="absolute bottom-0 block rounded-[50%_50%_50%_0]"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              background: "linear-gradient(135deg, #FBCFE8, #F9A8D4)",
              animation: `floatPetal ${p.duration} linear ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* 星のきらめき */}
      <svg className="pointer-events-none absolute inset-0 -z-[5] h-full w-full" aria-hidden>
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.left}
            cy={s.top}
            r={s.r}
            fill="#FFFDF7"
            style={{ animation: `twinkle 3s ease-in-out ${s.delay} infinite` }}
          />
        ))}
      </svg>

      {/* === 中央コンテンツ === */}
      <div className="relative z-10 flex flex-col items-center px-6 py-24 text-center sm:py-28">
        {/* ロゴ（主役） */}
        <div className="mb-6" style={{ animation: "fadeUp 0.8s ease-out both" }}>
          <Image
            src="/logo-10th.png"
            alt="すとぷり 10th Anniversary"
            width={360}
            height={200}
            priority
            className="h-auto w-[240px] sm:w-[360px]"
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* 期間テキスト */}
        <p
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(12px, 2vw, 15px)",
            letterSpacing: "0.3em",
            color: T.goldD,
            animation: "fadeUp 0.8s 0.2s ease-out both",
          }}
        >
          2026.6.4 — 2027.6.3
        </p>

        {/* キャッチコピー */}
        <p
          style={{
            fontFamily: "var(--font-noto-serif-jp), serif",
            fontSize: "clamp(13px, 2vw, 16px)",
            color: T.muted,
            marginTop: "12px",
            letterSpacing: "0.1em",
            animation: "fadeUp 0.8s 0.4s ease-out both",
          }}
        >
          10年間の軌跡を、ここに。
        </p>

        {/* スクロール誘導 */}
        <div
          className="mt-10 flex flex-col items-center gap-2"
          style={{ animation: "fadeUp 0.8s 0.6s ease-out both" }}
        >
          <span
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "10px",
              letterSpacing: "0.3em",
              color: T.muted,
            }}
          >
            SCROLL
          </span>
          <svg width="1" height="40" viewBox="0 0 1 40" aria-hidden>
            <line
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="40"
              stroke={T.gold}
              strokeWidth="1"
              style={{ animation: "scrollLine 1.5s ease-in-out infinite" }}
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
