import HeroSection from "@/components/home/HeroSection"
import CategoryGrid from "@/components/home/CategoryGrid"
import { T } from "@/lib/theme"

/**
 * 10周年特設サイト TOP。
 * 主役ロゴの HERO とベントー型カテゴリグリッドの2部構成。
 * 地のグラデーション背景は layout（theme-10th-bg）が供給する。
 */
export default function TopPage() {
  return (
    <>
      {/* HERO */}
      <HeroSection />

      {/* CATEGORY GRID */}
      <section className="px-5 pb-[100px] pt-20">
        <div className="mb-12 text-center">
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "11px",
              letterSpacing: "0.35em",
              color: T.gold,
              marginBottom: "8px",
            }}
          >
            CONTENTS
          </p>
          <h2
            style={{
              fontFamily: "var(--font-noto-serif-jp), serif",
              fontSize: "22px",
              fontWeight: 700,
              color: T.text,
            }}
          >
            10周年のすべて
          </h2>
        </div>
        <CategoryGrid />
      </section>
    </>
  )
}
