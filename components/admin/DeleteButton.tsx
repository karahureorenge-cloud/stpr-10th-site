"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { softDeleteRecord } from "@/lib/admin/crud-actions"

type Props = {
  basePath: string // 管理画面のベースパス（/admin or /stpr-10th-anniversary/admin）
  tableKey: string
  id: string
  label: string // 確認用の行ラベル
  /** ラッパーの追加クラス（SP で幅いっぱいにする等）。 */
  formClassName?: string
  /** ボタンの追加クラス。未指定時はデスクトップ用の小さめスタイル。 */
  className?: string
}

const DEFAULT_BUTTON_CLASS =
  "rounded-full border border-rose-300 px-3 py-1 text-xs text-rose-500 transition-colors hover:bg-rose-50"

/**
 * 削除ボタン。二重確認モーダルを表示し、削除理由（必須）を入力させてから
 * ソフト削除（ゴミ箱へ移動）する。物理削除はしない。
 */
export default function DeleteButton({
  basePath,
  tableKey,
  id,
  label,
  formClassName,
  className,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    if (pending) return
    setOpen(false)
    setReason("")
    setError(null)
  }

  const submit = async () => {
    if (!reason.trim()) return
    setPending(true)
    setError(null)
    const res = await softDeleteRecord(basePath, tableKey, id, reason)
    setPending(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    setOpen(false)
    setReason("")
    router.refresh()
  }

  return (
    <div className={formClassName}>
      <button type="button" onClick={() => setOpen(true)} className={className ?? DEFAULT_BUTTON_CLASS}>
        削除
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" onClick={close}>
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-bold text-[#3a2540]">本当に削除しますか？</h2>
              <p className="mt-1 text-sm text-[#6a5570]">
                「{label || "（無題）"}」をゴミ箱に移動します。ゴミ箱からは復元できます。
              </p>

              <label className="mt-4 block">
                <span className="text-xs font-medium tracking-wider text-gold-700">
                  削除理由<span className="ml-1 text-rose-500">*</span>
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder="例）重複登録のため / 公開前の誤作成 など"
                  className="mt-1.5 w-full rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
                />
                <span className="mt-1 block text-[11px] text-[#9a8aa0]">理由を入力しないと削除できません。</span>
              </label>

              {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={pending}
                  className="rounded-full border border-gold-200 px-5 py-2 text-sm text-[#6a5570] transition-colors hover:bg-gold-50 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={pending || !reason.trim()}
                  className="rounded-full bg-rose-500 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                >
                  {pending ? "移動中…" : "ゴミ箱に移動"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
