import AdminTableList from "@/components/admin/AdminTableList"

export const dynamic = "force-dynamic"

export default async function AdminTableListPage({
  params,
  searchParams,
}: {
  params: Promise<{ table: string }>
  searchParams: Promise<{ q?: string; group?: string; status?: string }>
}) {
  const { table } = await params
  const filters = await searchParams
  return <AdminTableList basePath="/admin" table={table} label="非公式ファンサイト" filters={filters} />
}
