import { notFound } from "next/navigation"
import AdminRecordView from "@/components/admin/AdminRecordView"
import { getTableConfig } from "@/lib/admin/tables"
import { createRecord } from "@/lib/admin/crud-actions"
import { loadDuplicateSource } from "@/lib/admin/record-source"

export const dynamic = "force-dynamic"

const BASE = "/stpr-10th-anniversary/admin"

export default async function Admin10thNewRecordPage({
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

  const initial = from ? await loadDuplicateSource(table, from, cfg.titleField) : undefined
  const action = createRecord.bind(null, BASE, table)

  return (
    <AdminRecordView
      basePath={BASE}
      table={table}
      cfg={cfg}
      action={action}
      initial={initial}
      mode={initial ? "duplicate" : "new"}
      label="10周年"
    />
  )
}
