import Link from "next/link"
import { notFound } from "next/navigation"
import AdminHeader from "@/components/admin/AdminHeader"
import BulkListTable, { type ListColumn } from "@/components/admin/BulkListTable"
import ListFilterBar from "@/components/admin/ListFilterBar"
import {
  getTableConfig,
  groupFilterField,
  GROUP_FILTER_OPTIONS,
  GROUP_FILTER_LABELS,
} from "@/lib/admin/tables"
import { createAdminClient } from "@/lib/supabase/admin"
import { getLiveStatus } from "@/lib/utils"

type Props = {
  basePath: string
  table: string
  label?: string
  filters?: { q?: string; group?: string; status?: string }
}

/** ilike を壊す文字を除去。 */
function sanitize(q: string): string {
  return q.replace(/[%_,()*\\]/g, " ").replace(/\s+/g, " ").trim()
}

/** 一覧の列ラベル。publish_status は「状態」固定、他はフィールド定義から。 */
function columnLabel(col: string, cfg: ReturnType<typeof getTableConfig>): string {
  if (col === "publish_status") return "状態"
  return cfg?.fields.find((f) => f.name === col)?.label ?? col
}

/** テーブルのレコード一覧（検索・フィルター・一括操作・状態バッジ付き）。 */
export default async function AdminTableList({ basePath, table, label, filters }: Props) {
  const cfg = getTableConfig(table)
  if (!cfg) notFound()

  const q = filters?.q ?? ""
  const group = filters?.group ?? ""
  const status = filters?.status ?? ""

  let rows: Record<string, unknown>[] = []
  let loadError: string | null = null
  try {
    const supabase = createAdminClient()
    let query = supabase.from(table).select("*").is("deleted_at", null)

    // lives はスコープで is_10th を出し分ける。
    if (table === "lives") {
      query = query.eq("is_10th", basePath.startsWith("/stpr-10th-anniversary"))
    }
    if (status === "draft" || status === "published") {
      query = query.eq("publish_status", status)
    }
    if (group) {
      const gf = groupFilterField(table)
      if (gf === "group_slugs") query = query.contains("group_slugs", [group])
      else if (gf === "group_slug") query = query.eq("group_slug", group)
    }
    const term = sanitize(q)
    if (term) query = query.ilike(cfg.titleField, `%${term}%`)

    query = query.order("sort_order", { ascending: true }).order("created_at", { ascending: true })
    const { data, error } = await query
    if (error) loadError = error.message
    else rows = (data ?? []) as Record<string, unknown>[]
  } catch (e) {
    loadError = e instanceof Error ? e.message : "読み込みに失敗しました。"
  }

  // lives の status は保存値ではなく period から都度計算して表示する。
  if (table === "lives") {
    rows = rows.map((r) => ({
      ...r,
      status: getLiveStatus(
        typeof r.period_start === "string" ? r.period_start : undefined,
        typeof r.period_end === "string" ? r.period_end : undefined,
      ),
    }))
  }

  const columns: ListColumn[] = cfg.listColumns.map((col) => {
    const field = cfg.fields.find((f) => f.name === col)
    return { name: col, label: columnLabel(col, cfg), type: field?.type, optionLabels: field?.optionLabels }
  })

  const gf = groupFilterField(table)
  const groupOptions = gf
    ? GROUP_FILTER_OPTIONS.map((v) => ({ value: v, label: GROUP_FILTER_LABELS[v] ?? v }))
    : undefined

  return (
    <>
      <AdminHeader basePath={basePath} label={label} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href={basePath}
              className="text-xs tracking-wider text-gold-500 transition-colors hover:text-gold-700"
            >
              ← ダッシュボード
            </Link>
            <div className="mt-2 flex items-center gap-3">
              <span aria-hidden className="h-8 w-1 shrink-0 rounded-sm" style={{ background: "var(--ad-bar)" }} />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-[11px] uppercase tracking-[0.3em] text-gold-600">{table}</span>
                <h1 className="font-serif text-xl font-bold text-[#3a2540]">
                  {cfg.label}
                  <span className="ml-2 text-sm font-normal text-[#9a8aa0]">{rows.length} 件</span>
                </h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`${basePath}/trash`}
              className="rounded-full border border-gold-200 px-5 py-2.5 text-sm text-[#6a5570] transition-colors hover:bg-gold-50"
            >
              ゴミ箱
            </Link>
            <Link
              href={`${basePath}/${table}/new`}
              className="rounded-full bg-gold-400 px-6 py-2.5 font-display text-sm tracking-[0.15em] text-white shadow-sm transition-colors hover:bg-gold-500"
            >
              ＋ 新規追加
            </Link>
          </div>
        </div>

        <ListFilterBar
          basePath={basePath}
          table={table}
          groupOptions={groupOptions}
          initial={{ q, group, status }}
        />

        {loadError && (
          <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            読み込みエラー: {loadError}
            <br />
            <span className="text-xs text-rose-400">
              Supabase の設定（URL / SUPABASE_SECRET_KEY）とマイグレーション実行を確認してください。
            </span>
          </p>
        )}

        <BulkListTable
          basePath={basePath}
          table={table}
          titleField={cfg.titleField}
          columns={columns}
          rows={rows}
        />
      </main>
    </>
  )
}
