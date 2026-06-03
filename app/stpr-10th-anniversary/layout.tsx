import type { Metadata } from "next"
import NavBar from "@/components/common/NavBar"
import BottomNav from "@/components/common/BottomNav"
import Footer from "@/components/common/Footer"
import { getCount } from "@/lib/repo"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site"

const OG_IMAGE = "/images/hero-bg.webp"

/**
 * 10周年特設サイトのデフォルトメタデータ（OGP / Twitter Card）。
 * 各ページの title / description / openGraph はこれを上書きできる。
 * 相対パスの og:image はルート layout の metadataBase で絶対URL化される。
 */
export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "ja_JP",
    images: [{ url: OG_IMAGE, width: 1800, height: 1069, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
}

/**
 * 10周年特設サイト共通レイアウト。
 * theme-10th トークンと地のグラデーション背景を適用し、ナビ・フッターを配置する。
 * PC はヘッダーナビ（NavBar）、SP は画面下部スライダー（BottomNav）。
 * MUSIC / ALBUM はデータがある場合のみ BottomNav に表示する。
 */
export default async function TenthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [musicCount, albumCount, visualCount] = await Promise.all([
    getCount("songs"),
    getCount("albums"),
    getCount("visuals"),
  ])
  const flags = {
    hasMusic: musicCount > 0,
    hasAlbum: albumCount > 0,
    hasVisual: visualCount > 0,
  }

  return (
    <div className="theme-10th theme-10th-bg flex min-h-screen flex-col font-serif">
      <NavBar {...flags} />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav {...flags} />
    </div>
  )
}
