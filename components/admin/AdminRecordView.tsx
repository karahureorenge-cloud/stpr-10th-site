import Link from "next/link"
import AdminHeader from "@/components/admin/AdminHeader"
import RecordForm from "@/components/admin/RecordForm"
import type { FormState } from "@/lib/admin/crud-actions"
import type { TableConfig } from "@/lib/admin/tables"

type Props = {
  basePath: string
  table: string
  cfg: TableConfig
  /** table を束縛済みの作成/更新 server action。 */
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  initial?: Record<string, unknown>
  mode: "new" | "edit" | "duplicate"
  label?: string
}

/** 新規/編集の共通シェル（ヘッダー + 見出し + RecordForm）。配色はスコープのトークンで切替。 */
export default function AdminRecordView({
  basePath,
  table,
  cfg,
  action,
  initial,
  mode,
  label,
}: Props) {
  const heading =
    mode === "edit"
      ? `${cfg.label}を編集`
      : mode === "duplicate"
        ? `${cfg.label}を複製`
        : `${cfg.label}を追加`
  const submitLabel =
    mode === "edit" ? "更新する" : mode === "duplicate" ? "複製して追加" : "追加する"

  return (
    <>
      <AdminHeader basePath={basePath} label={label} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href={`${basePath}/${table}`}
          className="text-xs tracking-wider text-gold-500 transition-colors hover:text-gold-700"
        >
          ← {cfg.label}一覧
        </Link>
        <div className="mb-8 mt-2 flex items-center gap-3">
          <span
            aria-hidden
            className="h-8 w-1 shrink-0 rounded-sm"
            style={{ background: "var(--ad-bar)" }}
          />
          <h1 className="font-serif text-xl font-bold text-[#3a2540]">{heading}</h1>
        </div>

        {mode === "duplicate" && (
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
            submitLabel={submitLabel}
            cancelHref={`${basePath}/${table}`}
          />
        </div>
      </main>
    </>
  )
}
