import Link from "next/link"
import AdminHeader from "@/components/admin/AdminHeader"
import NewsGenerator from "@/components/admin/NewsGenerator"

export const dynamic = "force-dynamic"

const BASE = "/admin"

// NEWS記事の自動生成ページ。元ネタ（X投稿・プレスリリース等）を貼り付けると
// Claude API が STPR INFO+ 専属ライター プロンプトで記事＋ツイート文を生成し、
// 確認・編集のうえ news テーブルに下書き（status=draft）保存する。
// 認証は proxy + 各 server action 内の assertAdmin で担保。
export default function AdminNewsGeneratePage() {
  return (
    <>
      <AdminHeader basePath={BASE} label="非公式ファンサイト" />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href={`${BASE}/news`}
          className="text-xs tracking-wider text-gold-500 transition-colors hover:text-gold-700"
        >
          ← NEWS一覧
        </Link>
        <div className="mb-8 mt-2 flex items-center gap-3">
          <span
            aria-hidden
            className="h-8 w-1 shrink-0 rounded-sm"
            style={{ background: "var(--ad-bar)" }}
          />
          <h1 className="font-serif text-xl font-bold text-[#3a2540]">NEWS記事を自動生成</h1>
        </div>

        <p className="mb-6 rounded-xl bg-gold-50 px-4 py-3 text-xs leading-relaxed text-gold-700">
          XのポストやプレスリリースなどのPR文を貼り付けて「記事生成」を押すと、STPR INFO+
          専属ライターのルールに沿って記事本文・ツイート文を生成します。内容を確認・編集してから
          「下書き保存」すると、公開フラグOFF（下書き）で保存されます。
        </p>

        <div className="rounded-2xl border border-gold-200/70 bg-white/80 p-6 shadow-sm">
          <NewsGenerator basePath={BASE} />
        </div>
      </main>
    </>
  )
}
