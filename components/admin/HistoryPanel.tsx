import { loadChangeLogs, type ChangeAction } from "@/lib/admin/change-log"
import { formatDateDot } from "@/lib/utils"

const ACTION_META: Record<ChangeAction, { label: string; cls: string }> = {
  create: { label: "作成", cls: "bg-blue-100 text-blue-700" },
  update: { label: "更新", cls: "bg-gold-100 text-gold-700" },
  publish: { label: "公開", cls: "bg-green-100 text-green-700" },
  unpublish: { label: "下書きに戻す", cls: "bg-gray-100 text-gray-600" },
  delete: { label: "ゴミ箱へ", cls: "bg-rose-100 text-rose-600" },
  restore: { label: "復元", cls: "bg-emerald-100 text-emerald-700" },
  hard_delete: { label: "完全削除", cls: "bg-rose-200 text-rose-800" },
}

const SCOPE_LABEL: Record<string, string> = {
  fansite: "非公式ファンサイト",
  "10th": "10周年",
  cron: "自動（予約公開）",
}

/** diff(jsonb) から人が読める要約を作る。 */
function summarize(action: ChangeAction, diff: unknown): string {
  if (!diff || typeof diff !== "object") return ""
  const d = diff as Record<string, unknown>
  if (action === "delete") return typeof d.reason === "string" ? `理由: ${d.reason}` : ""
  if (action === "update") {
    const after = (d.after as Record<string, unknown> | undefined) ?? {}
    const keys = Object.keys(after)
    return keys.length ? `変更: ${keys.join(", ")}` : "変更なし"
  }
  if (action === "create") {
    const t = d.title
    return typeof t === "string" && t ? `「${t}」` : ""
  }
  return ""
}

/** 1レコードの変更履歴パネル（編集画面の下に表示）。 */
export default async function HistoryPanel({ table, id }: { table: string; id: string }) {
  const logs = await loadChangeLogs(table, id)

  return (
    <details className="mt-6 rounded-2xl border border-gold-200/70 bg-white/80 shadow-sm" open>
      <summary className="cursor-pointer list-none px-6 py-4 font-serif text-base font-bold text-[#3a2540]">
        変更履歴
        <span className="ml-2 text-sm font-normal text-[#9a8aa0]">{logs.length} 件</span>
      </summary>
      <div className="border-t border-gold-100/70 px-6 py-4">
        {logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#9a8aa0]">
            履歴がありません（change_logs テーブル未作成の可能性があります）。
          </p>
        ) : (
          <ol className="space-y-3">
            {logs.map((log) => {
              const meta = ACTION_META[log.action] ?? { label: log.action, cls: "bg-gray-100 text-gray-600" }
              const who = log.changed_by ? (SCOPE_LABEL[log.changed_by] ?? log.changed_by) : "—"
              const summary = summarize(log.action, log.diff)
              return (
                <li key={log.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>
                    {meta.label}
                  </span>
                  <span className="text-[#6a5570]">{formatDateDot(log.changed_at)}</span>
                  <span className="text-[#9a8aa0]">{who}</span>
                  {summary && <span className="text-[#6a5570]">— {summary}</span>}
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </details>
  )
}
