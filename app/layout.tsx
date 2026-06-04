import type { Metadata, Viewport } from "next"
import { Noto_Serif_JP, Cinzel, Cormorant_Garamond } from "next/font/google"
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site"
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"
import "./globals.css"

// 和文見出し: Noto Serif JP
const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-serif-jp",
  display: "swap",
})

// 欧文ロゴ・ナビ: Cinzel（時計塔・ロイヤル感）
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
})

// 欧文サブ: Cormorant Garamond（繊細なセリフ）
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "ja_JP",
    images: [{ url: "/images/hero-bg.webp", width: 1800, height: 1069, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-bg.webp"],
  },
  // PWA: ホーム画面追加用の manifest と iOS 向けアイコン/設定。
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "すとぷり10th",
  },
  icons: {
    icon: "/logo-10th.png",
    apple: "/logo-10th.png",
  },
}

// PWA: テーマ色（ローズピンク）と背景色（パールホワイト）。
export const viewport: Viewport = {
  themeColor: "#F472B6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSerifJP.variable} ${cinzel.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
