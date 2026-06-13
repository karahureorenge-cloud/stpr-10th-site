import AdminTableList from "@/components/admin/AdminTableList"

export const dynamic = "force-dynamic"

export default async function Admin10thTableListPage({
  params,
  searchParams,
}: {
  params: Promise<{ table: string }>
  searchParams: Promise<{ q?: string; group?: string; status?: string }>
}) {
  const { table } = await params
  const filters = await searchParams
  return (
    <AdminTableList basePath="/stpr-10th-anniversary/admin" table={table} label="10周年" filters={filters} />
  )
}
