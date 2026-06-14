"use client"

import { useState } from "react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import DeleteButton from "@/components/admin/DeleteButton"
import StatusBadge from "@/components/common/StatusBadge"
import TypeBadge from "@/components/common/TypeBadge"
import { bulkSetPublish, bulkTrash } from "@/lib/admin/crud-actions"
import { formatDateDot } from "@/lib/utils"
import type { FieldType } from "@/lib/admin/tables"
import type { LiveStatus } from "@/data/lives"

export type ListColumn = {
  name: string
  label: string
  type?: FieldType
  optionLabels?: Record<string, string>
}

type Props = {
  basePath: string
  table: string
  titleField: string
  columns: ListColumn[]
  rows: Record<string, unknown>[]
}

const LIVE_STATUS = new Set(["coming", "ongoing", "finished"])

function PublishBadge({ value }: { value: unknown }) {
  const published = value === "published"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
        published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {published ? "公開" : "下書き"}
    </span>
  )
}

/** 公開/下書きをワンクリックで切り替えるトグル（一覧の各行用）。 */
function PublishToggle({
  value,
  busy,
  onToggle,
}: {
  value: unknown
  busy: boolean
  onToggle: () => void
}) {
  const published = value === "published"
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      title={published ? "クリックで下書きに（非公開）" : "クリックで公開"}
      aria-pressed={published}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors disabled:opacity-50 ${
        published
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${published ? "bg-green-500" : "bg-gray-400"}`} />
      {busy ? "…" : published ? "公開" : "下書き"}
    </button>
  )
}

function renderCell(col: ListColumn, value: unknown): ReactNode {
  if (col.name === "publish_status") return <PublishBadge value={value} />
  if (value == null || value === "") return <span className="text-[#c9bccd]">—</span>

  if (col.name === "status" && typeof value === "string" && LIVE_STATUS.has(value)) {
    return <StatusBadge status={value as LiveStatus} size="sm" />
  }
  if (col.type === "boolean" || typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">はい</span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">いいえ</span>
    )
  }
  if ((col.type === "select" || col.name === "category" || col.name === "event_type") && typeof value === "string") {
    return <TypeBadge label={col.optionLabels?.[value] ?? value} size="sm" />
  }
  if ((col.type === "date" || col.type === "datetime") && typeof value === "string") {
    return <span className="whitespace-nowrap text-[#6a5570]">{formatDateDot(value)}</span>
  }
  if (Array.isArray(value)) {
    return <span className="text-[#6a5570]">{value.length ? value.join(", ") : "—"}</span>
  }
  return <span className="text-[#3a2540]">{String(value)}</span>
}

export default function BulkListTable({ basePath, table, titleField, columns, rows }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trashOpen, setTrashOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [rowPending, setRowPending] = useState<string | null>(null)

  const ids = rows.map((r) => String(r.id))
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id))
  const selectedIds = [...selected]
  // publish_status が一覧の列にある場合はその列をトグル化し、専用列は足さない（重複回避）。
  const hasPublishCol = columns.some((c) => c.name === "publish_status")

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(ids))

  const afterAction = (res: { error?: string } | undefined) => {
    setPending(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    setSelected(new Set())
    setError(null)
    router.refresh()
  }

  const doPublish = async (status: "published" | "draft") => {
    if (!selectedIds.length) return
    setPending(true)
    setError(null)
    afterAction(await bulkSetPublish(basePath, table, selectedIds, status))
  }

  // 行ごとに公開/下書きを切り替え（一括APIを単一idで再利用）。
  const togglePublish = async (id: string, current: unknown) => {
    const next = current === "published" ? "draft" : "published"
    setRowPending(id)
    setError(null)
    const res = await bulkSetPublish(basePath, table, [id], next)
    setRowPending(null)
    if (res?.error) setError(res.error)
    else router.refresh()
  }

  const doTrash = async () => {
    if (!selectedIds.length || !reason.trim()) return
    setPending(true)
    setError(null)
    const res = await bulkTrash(basePath, table, selectedIds, reason)
    setTrashOpen(false)
    setReason("")
    afterAction(res)
  }

  const editHref = (id: string) => `${basePath}/${table}/${id}/edit`
  const dupHref = (id: string) => `${basePath}/${table}/new?from=${id}`

  return (
    <>
      {/* 一括操作バー */}
      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-20 mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gold-300 bg-white/95 px-4 py-3 shadow-md backdrop-blur">
          <span className="text-sm font-bold text-[#3a2540]">{selectedIds.length}件 選択中</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => doPublish("published")}
            className="rounded-full bg-gold-400 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
          >
            公開
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => doPublish("draft")}
            className="rounded-full border border-gold-300 px-5 py-2 text-sm text-gold-700 transition-colors hover:bg-gold-50 disabled:opacity-50"
          >
            下書きに戻す
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setTrashOpen(true)}
            className="rounded-full border border-rose-300 px-5 py-2 text-sm text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50"
          >
            ゴミ箱に移動
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-sm text-[#9a8aa0] hover:text-[#6a5570]"
          >
            選択解除
          </button>
        </div>
      )}

      {error && <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      {/* SP: カード形式 */}
      <div className="mt-6 space-y-3 md:hidden">
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-gold-200/70 bg-white/80 px-4 py-12 text-center text-sm text-[#9a8aa0] shadow-sm">
            該当するデータがありません。
          </p>
        ) : (
          rows.map((row) => {
            const id = String(row.id)
            const title = String(row[titleField] ?? "")
            return (
              <div key={id} className="rounded-2xl border border-gold-200/70 bg-white/80 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(id)}
                    onChange={() => toggle(id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-gold-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <PublishToggle
                        value={row.publish_status}
                        busy={rowPending === id}
                        onToggle={() => togglePublish(id, row.publish_status)}
                      />
                      <p className="truncate font-bold text-[#3a2540]">
                        {title || <span className="text-[#c9bccd]">（無題）</span>}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={editHref(id)} className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-gold-300 px-4 text-sm font-medium text-gold-700 transition-colors hover:bg-gold-50">
                    編集
                  </Link>
                  <Link href={dupHref(id)} className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-gold-300 px-4 text-sm font-medium text-gold-700 transition-colors hover:bg-gold-50">
                    複製
                  </Link>
                </div>
                <div className="mt-3 border-t border-gold-100/70 pt-3">
                  <DeleteButton
                    basePath={basePath}
                    tableKey={table}
                    id={id}
                    label={title}
                    formClassName="w-full"
                    className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-rose-300 px-4 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* PC: テーブル表示 */}
      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-gold-200/70 bg-white/80 shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gold-200/70 bg-gold-50/50 text-[11px] uppercase tracking-wider text-gold-600">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-gold-500" />
              </th>
              {columns.map((col) => (
                <th key={col.name} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              {!hasPublishCol && <th className="px-4 py-3 font-medium">公開</th>}
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2 + (hasPublishCol ? 0 : 1)} className="px-4 py-12 text-center text-[#9a8aa0]">
                  該当するデータがありません。
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = String(row.id)
                const title = String(row[titleField] ?? "")
                return (
                  <tr key={id} className="border-b border-gold-100/70 transition-colors last:border-0 hover:bg-gold-50/40">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(id)} onChange={() => toggle(id)} className="h-4 w-4 accent-gold-500" />
                    </td>
                    {columns.map((col) => {
                      const isTitle = col.name === titleField
                      return (
                        <td key={col.name} className={`px-4 py-3 ${isTitle ? "font-bold text-[#3a2540]" : ""}`}>
                          {col.name === "publish_status" ? (
                            <PublishToggle
                              value={row.publish_status}
                              busy={rowPending === id}
                              onToggle={() => togglePublish(id, row.publish_status)}
                            />
                          ) : (
                            renderCell(col, row[col.name])
                          )}
                        </td>
                      )
                    })}
                    {!hasPublishCol && (
                      <td className="px-4 py-3">
                        <PublishToggle
                          value={row.publish_status}
                          busy={rowPending === id}
                          onToggle={() => togglePublish(id, row.publish_status)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={editHref(id)} className="rounded-full border border-gold-300 px-3 py-1 text-xs text-gold-700 transition-colors hover:bg-gold-50">
                          編集
                        </Link>
                        <Link href={dupHref(id)} className="rounded-full border border-gold-300 px-3 py-1 text-xs text-gold-700 transition-colors hover:bg-gold-50">
                          複製
                        </Link>
                        <DeleteButton basePath={basePath} tableKey={table} id={id} label={title} />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 一括ゴミ箱の理由モーダル */}
      {trashOpen &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" onClick={() => !pending && setTrashOpen(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-base font-bold text-[#3a2540]">{selectedIds.length}件をゴミ箱に移動</h2>
              <p className="mt-1 text-sm text-[#6a5570]">ゴミ箱からは復元できます。削除理由を入力してください。</p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                autoFocus
                placeholder="例）重複登録のため など"
                className="mt-4 w-full rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
              />
              <div className="mt-5 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setTrashOpen(false)} disabled={pending} className="rounded-full border border-gold-200 px-5 py-2 text-sm text-[#6a5570] transition-colors hover:bg-gold-50 disabled:opacity-50">
                  キャンセル
                </button>
                <button type="button" onClick={doTrash} disabled={pending || !reason.trim()} className="rounded-full bg-rose-500 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-50">
                  {pending ? "移動中…" : "ゴミ箱に移動"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
