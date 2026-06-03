import Link from "next/link"
import { notFound } from "next/navigation"
import AdminHeader from "@/components/admin/AdminHeader"
import RecordForm from "@/components/admin/RecordForm"
import { getTableConfig } from "@/lib/admin/tables"
import { createAdminClient } from "@/lib/supabase/admin"
import { createRecord } from "@/app/admin/crud-actions"

export const dynamic = "force-dynamic"

/** 複製元レコードを取得し、新規フォーム用の初期値に変換する。 */
async function loadDuplicateSource(
  table: string,
  fromId: string,
  titleField: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from(table)
      .select("*")
      .eq("id", fromId)
      .maybeSingle()
    if (!data) return undefined
    const row = { ...(data as Record<string, unknown>) }
    // 自動採番・タイムスタンプは引き継がない。
    delete row.id
    delete row.created_at
    delete row.updated_at
    // slug は空に（重複防止）。
    row.slug = ""
    // タイトルに（コピー）を付与。
    const t = row[titleField]
    if (typeof t === "string" && t) row[titleField] = `${t}（コピー）`
    return row
  } catch {
    return undefined
  }
}

export default async function AdminNewRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ table: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { table } = await params
  const { from } = await searchParams
  const cfg = getTableConfig(table)
  if (!cfg) notFound()

  // 複製元が指定されていれば初期値を用意する。
  const initial = from
    ? await loadDuplicateSource(table, from, cfg.titleField)
    : undefined
  const isDuplicate = Boolean(initial)

  // table を束縛した作成アクション。
  const action = createRecord.bind(null, table)

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href={`/admin/${table}`}
          className="text-xs tracking-wider text-gold-500 transition-colors hover:text-gold-700"
        >
          ← {cfg.label}一覧
        </Link>
        <div className="mt-2 mb-8 flex items-center gap-3">
          <span
            aria-hidden
            className="h-8 w-1 shrink-0 rounded-sm"
            style={{ background: "linear-gradient(180deg, #D4A853 0%, #F472B6 100%)" }}
          />
          <h1 className="font-serif text-xl font-bold text-[#3a2540]">
            {cfg.label}を{isDuplicate ? "複製" : "追加"}
          </h1>
        </div>

        {isDuplicate && (
          <p className="mb-4 rounded-xl bg-gold-50 px-4 py-2 text-xs text-gold-700">
            複製元の内容をコピーしました。スラッグ（URL）を入力してから保存してください。
          </p>
        )}

        <div className="rounded-2xl border border-gold-200/70 bg-white/80 p-6 shadow-sm">
          <RecordForm
            action={action}
            fields={cfg.fields}
            table={table}
            initial={initial}
            submitLabel={isDuplicate ? "複製して追加" : "追加する"}
            cancelHref={`/admin/${table}`}
          />
        </div>
      </main>
    </>
  )
}
