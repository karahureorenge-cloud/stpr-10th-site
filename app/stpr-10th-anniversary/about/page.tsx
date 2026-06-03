import type { Metadata } from "next"
import type { ReactNode } from "react"
import PageContainer from "@/components/common/PageContainer"

export const metadata: Metadata = {
  title: "当サイトについて",
  description: "【非公式】すとぷり 10周年特設サイトについて（非公式・運営・情報源・免責事項）。",
}

function AboutSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gold-200/70 bg-white/55 p-5 shadow-sm backdrop-blur-sm md:p-6">
      <h2 className="mb-3 flex items-center gap-2 font-serif text-base font-bold text-[#3a2540]">
        <span className="block h-4 w-1 rounded-sm bg-gold-400" aria-hidden />
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-[#6a5570]">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <PageContainer subtitle="ABOUT" title="当サイトについて">
      {/* 非公式の注意書き */}
      <p className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm font-medium text-[#8a4a7a]">
        本サイトは、株式会社STPR・すとぷりメンバー・関係各社とは一切関係のない非公式のファンサイトです。
      </p>

      <div className="flex flex-col gap-4">
        <AboutSection title="サイト概要">
          <p>
            すとぷり10周年（2026.6.4〜2027.6.3）の1年間の活動を記録・アーカイブする非公式特設サイトです。
            ライブ・イベント・グッズ・楽曲・アルバム・雑誌・メディア出演の情報を横断的に閲覧できます。
          </p>
        </AboutSection>

        <AboutSection title="非公式サイトについて">
          <p>
            当サイトは、株式会社STPRおよびすとぷりメンバー・関係各社とは一切関係のない非公式サイトです。
            最新情報は必ず公式の発表をご確認ください。
          </p>
        </AboutSection>

        <AboutSection title="運営について">
          <p>
            STPR非公式ファンサイト（
            <a
              href="https://stpr-fansite.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-700 underline-offset-2 hover:underline"
            >
              stpr-fansite.vercel.app
            </a>
            ）の管理人が、本サイトの制作・運営を行っています。
          </p>
        </AboutSection>

        <AboutSection title="情報源について">
          <p>
            各メンバーの公式X・YouTube・公式サイト・株式会社STPRの公式情報をもとに掲載しています。
            画像・ロゴ・名称等の権利は、各権利者に帰属します。
          </p>
        </AboutSection>

        <AboutSection title="免責事項">
          <p>
            掲載情報の正確性については万全を期していますが、誤りが含まれる場合があります。
            また、当サイトでは収益化を一切行っていません。
            権利者の方で削除等のご要望がある場合は、お問い合わせよりご連絡ください。
          </p>
        </AboutSection>

        <AboutSection title="お問い合わせ">
          <p>現在準備中です。</p>
        </AboutSection>
      </div>
    </PageContainer>
  )
}
