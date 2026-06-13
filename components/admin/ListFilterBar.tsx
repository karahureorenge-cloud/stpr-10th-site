"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  basePath: string
  table: string
  /** グループ絞り込み対象列があれば options を渡す（無ければグループ select 非表示）。 */
  groupOptions?: { value: string; label: string }[]
  initial: { q: string; group: string; status: string }
}

const selCls =
  "rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"

/** 一覧の検索・グループ・ステータス絞り込みバー。変更で URL の searchParams を更新する。 */
export default function ListFilterBar({ basePath, table, groupOptions, initial }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(initial.q)
  const [group, setGroup] = useState(initial.group)
  const [status, setStatus] = useState(initial.status)

  const push = (next: { q?: string; group?: string; status?: string }) => {
    const params = new URLSearchParams()
    const qv = next.q ?? q
    const gv = next.group ?? group
    const sv = next.status ?? status
    if (qv.trim()) params.set("q", qv.trim())
    if (gv) params.set("group", gv)
    if (sv) params.set("status", sv)
    const qs = params.toString()
    router.push(`${basePath}/${table}${qs ? `?${qs}` : ""}`)
  }

  const reset = () => {
    setQ("")
    setGroup("")
    setStatus("")
    router.push(`${basePath}/${table}`)
  }

  const hasFilter = q.trim() !== "" || group !== "" || status !== ""

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          push({})
        }}
        className="flex flex-1 items-center gap-2"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="タイトルで検索…"
          className={`${selCls} min-w-[180px] flex-1`}
        />
        <button
          type="submit"
          className="rounded-full bg-gold-400 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-500"
        >
          検索
        </button>
      </form>

      {groupOptions && groupOptions.length > 0 && (
        <select
          value={group}
          onChange={(e) => {
            setGroup(e.target.value)
            push({ group: e.target.value })
          }}
          className={selCls}
        >
          <option value="">全グループ</option>
          {groupOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value)
          push({ status: e.target.value })
        }}
        className={selCls}
      >
        <option value="">全ステータス</option>
        <option value="published">公開</option>
        <option value="draft">下書き</option>
      </select>

      {hasFilter && (
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-gold-200 px-4 py-2 text-sm text-[#6a5570] transition-colors hover:bg-gold-50"
        >
          クリア
        </button>
      )}
    </div>
  )
}
