import Link from "next/link"
import AdminHeader from "@/components/admin/AdminHeader"
import { TABLES, TABLE_KEYS } from "@/lib/admin/tables"
import { createAdminClient } from "@/lib/supabase/admin"

type Props = {
  basePath: string
  /** ヘッダー右の系統ラベル（例: "10周年" / "非公式ファンサイト"）。 */
  label?: string
  /** ダッシュボード見出し下の説明。 */
  caption?: string
}

async function getCounts(): Promise<Record<string, number | null>> {
  const counts: Record<string, number | null> = {}
  try {
    const supabase = createAdminClient()
    await Promise.all(
      TABLE_KEYS.map(async (key) => {
        const { count, error } = await supabase
          .from(key)
          .select("*", { count: "exact", head: true })
        counts[key] = error ? null : (count ?? 0)
      }),
    )
  } catch {
    for (const key of TABLE_KEYS) counts[key] = null
  }
  return counts
}

/** 管理ダッシュボード（テーブル一覧）。配色はスコープのトークンで切替。 */
export default async function AdminDashboard({ basePath, label, caption }: Props) {
  const counts = await getCounts()

  return (
    <>
      <AdminHeader basePath={basePath} label={label} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-8 w-1 shrink-0 rounded-sm"
            style={{ background: "var(--ad-bar)" }}
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[11px] uppercase tracking-[0.3em] text-gold-600">
              Dashboard
            </span>
            <h1 className="font-serif text-xl font-bold text-[#3a2540]">コンテンツ管理</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-[#6a5570]">
          {caption ?? "編集したいテーブルを選択してください。"}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TABLE_KEYS.map((key) => {
            const cfg = TABLES[key]
            const count = counts[key]
            return (
              <Link
                key={key}
                href={`${basePath}/${key}`}
                className="group flex flex-col gap-1 rounded-2xl border border-gold-200/70 bg-white/80 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
              >
                <span className="font-display text-xs uppercase tracking-[0.2em] text-gold-500">
                  {key}
                </span>
                <span className="font-serif text-lg font-bold text-[#3a2540] group-hover:text-gold-700">
                  {cfg.label}
                </span>
                <span className="mt-1 inline-flex w-fit items-center rounded-full bg-gold-50 px-3 py-1 text-xs font-medium text-gold-600">
                  {count === null ? "件数不明" : `${count} 件`}
                </span>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}
