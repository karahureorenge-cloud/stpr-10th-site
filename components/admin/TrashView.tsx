import Link from "next/link"
import AdminHeader from "@/components/admin/AdminHeader"
import TrashItemActions from "@/components/admin/TrashItemActions"
import { TABLE_KEYS, getTableConfig } from "@/lib/admin/tables"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatDateDot } from "@/lib/utils"

type Props = { basePath: string; label?: string }

type TrashGroup = {
  table: string
  label: string
  rows: Record<string, unknown>[]
}

/** 全テーブルから deleted_at が入った行を集めて返す。 */
async function loadTrash(basePath: string): Promise<{ groups: TrashGroup[]; error: string | null }> {
  let error: string | null = null
  const groups: TrashGroup[] = []
  try {
    const supabase = createAdminClient()
    await Promise.all(
      TABLE_KEYS.map(async (table) => {
        let query = supabase
          .from(table)
          .select("*")
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false })
        // lives はスコープで出し分け。
        if (table === "lives") {
          query = query.eq("is_10th", basePath.startsWith("/stpr-10th-anniversary"))
        }
        const { data, error: e } = await query
        if (e) {
          error = e.message
          return
        }
        if (data && data.length > 0) {
          const cfg = getTableConfig(table)
          groups.push({ table, label: cfg?.label ?? table, rows: data as Record<string, unknown>[] })
        }
      }),
    )
  } catch (e) {
    error = e instanceof Error ? e.message : "読み込みに失敗しました。"
  }
  // 表示順は TABLE_KEYS 準拠に揃える。
  groups.sort((a, b) => TABLE_KEYS.indexOf(a.table) - TABLE_KEYS.indexOf(b.table))
  return { groups, error }
}

/** ゴミ箱：ソフト削除されたレコードをテーブル別に表示し、復元/完全削除する。 */
export default async function TrashView({ basePath, label }: Props) {
  const { groups, error } = await loadTrash(basePath)
  const total = groups.reduce((n, g) => n + g.rows.length, 0)

  return (
    <>
      <AdminHeader basePath={basePath} label={label} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link href={basePath} className="text-xs tracking-wider text-gold-500 transition-colors hover:text-gold-700">
          ← ダッシュボード
        </Link>
        <div className="mb-8 mt-2 flex items-center gap-3">
          <span aria-hidden className="h-8 w-1 shrink-0 rounded-sm" style={{ background: "var(--ad-bar)" }} />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[11px] uppercase tracking-[0.3em] text-gold-600">Trash</span>
            <h1 className="font-serif text-xl font-bold text-[#3a2540]">
              ゴミ箱
              <span className="ml-2 text-sm font-normal text-[#9a8aa0]">{total} 件</span>
            </h1>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">読み込みエラー: {error}</p>
        )}

        {total === 0 ? (
          <p className="rounded-2xl border border-gold-200/70 bg-white/80 px-4 py-12 text-center text-sm text-[#9a8aa0] shadow-sm">
            ゴミ箱は空です。
          </p>
        ) : (
          <div className="space-y-8">
            {groups.map((g) => {
              const cfg = getTableConfig(g.table)
              const titleField = cfg?.titleField ?? "title"
              return (
                <section key={g.table}>
                  <h2 className="mb-3 font-serif text-base font-bold text-[#3a2540]">
                    {g.label}
                    <span className="ml-2 text-sm font-normal text-[#9a8aa0]">{g.rows.length} 件</span>
                  </h2>
                  <div className="overflow-hidden rounded-2xl border border-gold-200/70 bg-white/80 shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gold-200/70 bg-gold-50/50 text-[11px] uppercase tracking-wider text-gold-600">
                          <th className="px-4 py-3 font-medium">タイトル</th>
                          <th className="px-4 py-3 font-medium">削除日時</th>
                          <th className="px-4 py-3 text-right font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.rows.map((row) => {
                          const id = String(row.id)
                          const title = String(row[titleField] ?? "")
                          return (
                            <tr key={id} className="border-b border-gold-100/70 last:border-0">
                              <td className="px-4 py-3 font-bold text-[#3a2540]">
                                {title || <span className="text-[#c9bccd]">（無題）</span>}
                              </td>
                              <td className="px-4 py-3 text-[#6a5570]">
                                {typeof row.deleted_at === "string" ? formatDateDot(row.deleted_at) : "—"}
                              </td>
                              <td className="px-4 py-3">
                                <TrashItemActions basePath={basePath} table={g.table} id={id} label={title} />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
