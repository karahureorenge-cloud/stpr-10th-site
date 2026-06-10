import AdminLogin from "@/components/admin/AdminLogin"

export default async function Admin10thLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const { error, from } = await searchParams
  return (
    <AdminLogin
      basePath="/stpr-10th-anniversary/admin"
      subtitle="すとぷり 10周年 管理画面"
      error={error}
      from={from}
    />
  )
}
