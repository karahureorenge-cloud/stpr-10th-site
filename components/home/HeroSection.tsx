import Image from "next/image"

// 花びらパーティクル（決定的な値でハイドレーション不一致を回避）。控えめに9個。
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

// 小さな星（✦）20個。サイズ4〜10px / opacity 0.3〜0.6 / twinkle。決定的座標。
const STARS = [
  { top: 8, left: 12, size: 8, opacity: 0.5, delay: 0 },
  { top: 14, left: 78, size: 6, opacity: 0.45, delay: 0.6 },
  { top: 21, left: 30, size: 5, opacity: 0.4, delay: 1.2 },
  { top: 11, left: 55, size: 7, opacity: 0.55, delay: 0.9 },
  { top: 27, left: 88, size: 4, opacity: 0.35, delay: 1.6 },
  { top: 33, left: 8, size: 9, opacity: 0.5, delay: 0.3 },
  { top: 38, left: 64, size: 5, opacity: 0.4, delay: 2.0 },
  { top: 44, left: 20, size: 7, opacity: 0.5, delay: 1.1 },
  { top: 18, left: 42, size: 4, opacity: 0.3, delay: 2.4 },
  { top: 52, left: 82, size: 6, opacity: 0.45, delay: 0.5 },
  { top: 58, left: 14, size: 8, opacity: 0.55, delay: 1.8 },
  { top: 63, left: 48, size: 5, opacity: 0.4, delay: 0.8 },
  { top: 69, left: 73, size: 6, opacity: 0.5, delay: 2.2 },
  { top: 74, left: 26, size: 5, opacity: 0.4, delay: 1.4 },
  { top: 78, left: 90, size: 7, opacity: 0.5, delay: 0.2 },
  { top: 83, left: 6, size: 6, opacity: 0.45, delay: 1.9 },
  { top: 86, left: 58, size: 10, opacity: 0.6, delay: 0.7 },
  { top: 90, left: 37, size: 5, opacity: 0.4, delay: 1.3 },
  { top: 47, left: 95, size: 4, opacity: 0.3, delay: 2.6 },
  { top: 55, left: 38, size: 6, opacity: 0.45, delay: 1.0 },
]

// ✦ 4方向星のポリゴン頂点（viewBox 0 0 24 24）。
const STAR_POINTS = "12,2 13.6,10.4 22,12 13.6,13.6 12,22 10.4,13.6 2,12 10.4,10.4"

/**
 * トップの HERO。
 * - 背景: hero-bg.webp を objectFit:contain で全面表示（引き伸ばし禁止）。
 *   余白（レターボックス）はピンク〜ラベンダーのグラデで埋める。
 * - セクションは画像比率に合わせて aspect-ratio 16/9。
 * - 上部中央にロゴのみを配置（テキストは画像下の帯＝page.tsx 側へ）。
 * - 星(✦)・花びらの装飾は維持。時計シルエット・旧グラデ背景は廃止。
 */
export default function HeroSection() {
  return (
    <section
      className="relative isolate flex flex-col items-center justify-start overflow-hidden"
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* 背景画像（objectFit: cover・横幅いっぱい） */}
      <div className="absolute inset-0 -z-30">
        <Image
          src="/images/hero-bg.webp"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center center",
            opacity: 1,
          }}
          priority
        />
      </div>

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

      {/* 小さな星(✦) */}
      <div className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden" aria-hidden>
        {STARS.map((s, i) => (
          <span
            key={`star-${i}`}
            className="absolute"
            style={{ top: `${s.top}%`, left: `${s.left}%`, opacity: s.opacity }}
          >
            <svg
              width={s.size}
              height={s.size}
              viewBox="0 0 24 24"
              style={{ display: "block", animation: `twinkle 3s ease-in-out ${s.delay}s infinite` }}
            >
              <polygon points={STAR_POINTS} fill="#FFFDF7" />
            </svg>
          </span>
        ))}
      </div>

      {/* === 中央のコンテンツ（ロゴのみ・アーチ頂点付近に配置） === */}
      <div
        className="relative z-10 flex flex-col items-center px-6"
        style={{ paddingTop: "5%" }}
      >
        <div style={{ animation: "fadeUp 0.8s ease-out both" }}>
          <Image
            src="/logo-10th.png"
            alt="すとぷり 10th Anniversary"
            width={360}
            height={200}
            priority
            className="h-auto w-[160px] object-contain sm:w-[200px] md:w-[240px] lg:w-[320px]"
          />
        </div>
      </div>

      {/* 下部の白フェード（直後の白背景エリアとシームレスに繋ぐ） */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: "linear-gradient(to bottom, transparent, rgba(255,248,251,0.95))",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />
    </section>
  )
}
