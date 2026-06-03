import Link from "next/link"
import { notFound } from "next/navigation"
import AdminHeader from "@/components/admin/AdminHeader"
import RecordForm from "@/components/admin/RecordForm"
import { getTableConfig } from "@/lib/admin/tables"
import { createRecord } from "@/app/admin/crud-actions"

export const dynamic = "force-dynamic"

export default async function AdminNewRecordPage({
  params,
}: {
  params: Promise<{ table: string }>
}) {
  const { table } = await params
  const cfg = getTableConfig(table)
  if (!cfg) notFound()

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
            {cfg.label}を追加
          </h1>
        </div>

        <div className="rounded-2xl border border-gold-200/70 bg-white/80 p-6 shadow-sm">
          <RecordForm
            action={action}
            fields={cfg.fields}
            table={table}
            submitLabel="追加する"
            cancelHref={`/admin/${table}`}
          />
        </div>
      </main>
    </>
  )
}
