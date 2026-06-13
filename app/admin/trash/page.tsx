import TrashView from "@/components/admin/TrashView"

export const dynamic = "force-dynamic"

export default function AdminTrashPage() {
  return <TrashView basePath="/admin" label="非公式ファンサイト" />
}
