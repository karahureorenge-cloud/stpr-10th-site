import NavBar from "@/components/common/NavBar"
import BottomNav from "@/components/common/BottomNav"
import Footer from "@/components/common/Footer"
import { getCount } from "@/lib/repo"

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
  const [musicCount, albumCount] = await Promise.all([
    getCount("songs"),
    getCount("albums"),
  ])

  return (
    <div className="theme-10th theme-10th-bg flex min-h-screen flex-col font-serif">
      <NavBar hasMusic={musicCount > 0} hasAlbum={albumCount > 0} />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav hasMusic={musicCount > 0} hasAlbum={albumCount > 0} />
    </div>
  )
}
