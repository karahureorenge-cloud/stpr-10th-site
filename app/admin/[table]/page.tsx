import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import AdminHeader from "@/components/admin/AdminHeader"
import DeleteButton from "@/components/admin/DeleteButton"
import StatusBadge from "@/components/common/StatusBadge"
import TypeBadge from "@/components/common/TypeBadge"
import { getTableConfig, type Field } from "@/lib/admin/tables"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatDateDot } from "@/lib/utils"
import type { LiveStatus } from "@/data/lives"

export const dynamic = "force-dynamic"

const STATUS_VALUES = new Set(["coming", "ongoing", "finished"])

/** セル表示用に値を整形する。列の意味に応じてバッジ・日付・真偽を描き分ける。 */
function renderCell(col: string, value: unknown, field?: Field): ReactNode {
  if (value == null || value === "") return <span className="text-[#c9bccd]">—</span>

  // ステータス列はライブ状態バッジで表示。
  if (col === "status" && typeof value === "string" && STATUS_VALUES.has(value)) {
    return <StatusBadge status={value as LiveStatus} size="sm" />
  }

  // 真偽値はピルで表示。
  if (field?.type === "boolean" || typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
        はい
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
        いいえ
      </span>
    )
  }

  // 種別・カテゴリはタイプバッジで表示。
  if (
    (field?.type === "select" || col === "category" || col === "event_type") &&
    typeof value === "string"
  ) {
    return <TypeBadge label={value} size="sm" />
  }

  // 日付はドット区切りに整形。
  if (field?.type === "date" && typeof value === "string") {
    return <span className="whitespace-nowrap text-[#6a5570]">{formatDateDot(value)}</span>
  }

  if (Array.isArray(value)) {
    return <span className="text-[#6a5570]">{value.length ? value.join(", ") : "—"}</span>
  }

  return <span className="text-[#3a2540]">{String(value)}</span>
}

export default async function AdminTableListPage({
  params,
}: {
  params: Promise<{ table: string }>
}) {
  const { table } = await params
  const cfg = getTableConfig(table)
  if (!cfg) notFound()

  let rows: Record<string, unknown>[] = []
  let loadError: string | null = null
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
    if (error) loadError = error.message
    else rows = (data ?? []) as Record<string, unknown>[]
  } catch (e) {
    loadError = e instanceof Error ? e.message : "読み込みに失敗しました。"
  }

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="text-xs tracking-wider text-gold-500 transition-colors hover:text-gold-700"
            >
              ← ダッシュボード
            </Link>
            <div className="mt-2 flex items-center gap-3">
              <span
                aria-hidden
                className="h-8 w-1 shrink-0 rounded-sm"
                style={{ background: "linear-gradient(180deg, #D4A853 0%, #F472B6 100%)" }}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-[11px] uppercase tracking-[0.3em] text-gold-600">
                  {table}
                </span>
                <h1 className="font-serif text-xl font-bold text-[#3a2540]">
                  {cfg.label}
                  <span className="ml-2 text-sm font-normal text-[#9a8aa0]">
                    {rows.length} 件
                  </span>
                </h1>
              </div>
            </div>
          </div>
          <Link
            href={`/admin/${table}/new`}
            className="rounded-full bg-gold-400 px-6 py-2.5 font-display text-sm tracking-[0.15em] text-white shadow-sm transition-colors hover:bg-gold-500"
          >
            ＋ 新規追加
          </Link>
        </div>

        {loadError && (
          <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            読み込みエラー: {loadError}
            <br />
            <span className="text-xs text-rose-400">
              Supabase の設定（URL / SUPABASE_SECRET_KEY）とマイグレーション実行を確認してください。
            </span>
          </p>
        )}

        {/* SP（モバイル）: 横スクロールを避けるためカード形式（縦並び）で表示。
            タイトル + 日付など最低限のみ。操作ボタンは大きく・縦並び・削除は分離。 */}
        <div className="mt-6 space-y-3 md:hidden">
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-gold-200/70 bg-white/80 px-4 py-12 text-center text-sm text-[#9a8aa0] shadow-sm">
              データがありません。「＋ 新規追加」から登録してください。
            </p>
          ) : (
            rows.map((row) => {
              const id = String(row.id)
              const title = String(row[cfg.titleField] ?? "")
              // 日付列（type=date）を 1 つだけ抽出して補助情報に表示。
              const dateCol = cfg.listColumns.find(
                (col) => cfg.fields.find((f) => f.name === col)?.type === "date",
              )
              const dateField = dateCol ? cfg.fields.find((f) => f.name === dateCol) : undefined
              return (
                <div
                  key={id}
                  className="rounded-2xl border border-gold-200/70 bg-white/80 p-4 shadow-sm"
                >
                  <p className="font-bold text-[#3a2540]">
                    {title || <span className="text-[#c9bccd]">（無題）</span>}
                  </p>
                  {dateCol && (
                    <div className="mt-1 text-sm">{renderCell(dateCol, row[dateCol], dateField)}</div>
                  )}
                  {/* 編集・複製は横並び（各 44px 以上）。削除は誤タップ防止で分離。 */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/admin/${table}/${id}/edit`}
                      className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-gold-300 px-4 text-sm font-medium text-gold-700 transition-colors hover:bg-gold-50"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/admin/${table}/new?from=${id}`}
                      className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-gold-300 px-4 text-sm font-medium text-gold-700 transition-colors hover:bg-gold-50"
                    >
                      複製
                    </Link>
                  </div>
                  <div className="mt-3 border-t border-gold-100/70 pt-3">
                    <DeleteButton
                      tableKey={table}
                      id={id}
                      label={title}
                      formClassName="w-full"
                      className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-rose-300 px-4 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* PC（md 以上）: 従来のテーブル表示。 */}
        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-gold-200/70 bg-white/80 shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold-200/70 bg-gold-50/50 text-[11px] uppercase tracking-wider text-gold-600">
                {cfg.listColumns.map((col) => (
                  <th key={col} className="px-4 py-3 font-medium">
                    {cfg.fields.find((f) => f.name === col)?.label ?? col}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={cfg.listColumns.length + 1}
                    className="px-4 py-12 text-center text-[#9a8aa0]"
                  >
                    データがありません。「＋ 新規追加」から登録してください。
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const id = String(row.id)
                  const title = String(row[cfg.titleField] ?? "")
                  return (
                    <tr
                      key={id}
                      className="border-b border-gold-100/70 transition-colors last:border-0 hover:bg-gold-50/40"
                    >
                      {cfg.listColumns.map((col) => {
                        const field = cfg.fields.find((f) => f.name === col)
                        const isTitle = col === cfg.titleField
                        return (
                          <td
                            key={col}
                            className={`px-4 py-3 ${isTitle ? "font-bold text-[#3a2540]" : ""}`}
                          >
                            {renderCell(col, row[col], field)}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/${table}/${id}/edit`}
                            className="rounded-full border border-gold-300 px-3 py-1 text-xs text-gold-700 transition-colors hover:bg-gold-50"
                          >
                            編集
                          </Link>
                          <Link
                            href={`/admin/${table}/new?from=${id}`}
                            className="rounded-full border border-gold-300 px-3 py-1 text-xs text-gold-700 transition-colors hover:bg-gold-50"
                          >
                            複製
                          </Link>
                          <DeleteButton tableKey={table} id={id} label={title} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
