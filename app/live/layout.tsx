import type { Metadata } from "next"
import LiveHeader from "@/components/layout/LiveHeader"

export const metadata: Metadata = {
  title: "ライブ",
  description: "すとぷり・騎士X・AMPTAK×COLORS ほか STPR 各グループのライブ情報。",
}

/**
 * 公開 /live セクション専用レイアウト。
 * 10周年テーマ（theme-10th）は使わず、STPR Blue のシンプルなヘッダーのみ。
 * サイドバーなし。
 */
export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <LiveHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
