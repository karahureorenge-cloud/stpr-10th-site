import AdminTableList from "@/components/admin/AdminTableList"

export const dynamic = "force-dynamic"

export default async function Admin10thTableListPage({
  params,
}: {
  params: Promise<{ table: string }>
}) {
  const { table } = await params
  return <AdminTableList basePath="/stpr-10th-anniversary/admin" table={table} label="10周年" />
}
