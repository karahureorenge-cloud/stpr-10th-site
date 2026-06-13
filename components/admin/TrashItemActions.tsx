"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { restoreRecord, hardDeleteRecord } from "@/lib/admin/crud-actions"

type Props = {
  basePath: string
  table: string
  id: string
  label: string
}

/** ゴミ箱の各行の操作（復元 / 完全削除）。 */
export default function TrashItemActions({ basePath, table, id, label }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const restore = async () => {
    setPending(true)
    setError(null)
    const res = await restoreRecord(basePath, table, id)
    setPending(false)
    if (res?.error) return setError(res.error)
    router.refresh()
  }

  const purge = async () => {
    if (!confirm(`「${label || "（無題）"}」を完全に削除します。元に戻せません。よろしいですか？`)) return
    setPending(true)
    setError(null)
    const res = await hardDeleteRecord(basePath, table, id)
    setPending(false)
    if (res?.error) return setError(res.error)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-rose-500">{error}</span>}
      <button
        type="button"
        onClick={restore}
        disabled={pending}
        className="rounded-full border border-gold-300 px-3 py-1 text-xs text-gold-700 transition-colors hover:bg-gold-50 disabled:opacity-50"
      >
        復元
      </button>
      <button
        type="button"
        onClick={purge}
        disabled={pending}
        className="rounded-full border border-rose-300 px-3 py-1 text-xs text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50"
      >
        完全削除
      </button>
    </div>
  )
}
