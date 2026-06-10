// 非公式ファンサイト 管理画面レイアウト（STPR Blue）。公開サイトのテーマとは分離。
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-fansite min-h-screen bg-gold-50/40 font-serif">{children}</div>
}
