import { notFound } from "next/navigation"
import AdminRecordView from "@/components/admin/AdminRecordView"
import { getTableConfig } from "@/lib/admin/tables"
import { updateRecord } from "@/lib/admin/crud-actions"
import { loadRecordById } from "@/lib/admin/record-source"

export const dynamic = "force-dynamic"

const BASE = "/stpr-10th-anniversary/admin"

export default async function Admin10thEditRecordPage({
  params,
}: {
  params: Promise<{ table: string; id: string }>
}) {
  const { table, id } = await params
  const cfg = getTableConfig(table)
  if (!cfg) notFound()

  const { data, error } = await loadRecordById(table, id)
  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">読み込みエラー: {error}</p>
      </main>
    )
  }
  if (!data) notFound()

  const action = updateRecord.bind(null, BASE, table, id)

  return (
    <AdminRecordView
      basePath={BASE}
      table={table}
      cfg={cfg}
      action={action}
      initial={data}
      mode="edit"
      label="10周年"
    />
  )
}
