"use client"

import { deleteRecord } from "@/lib/admin/crud-actions"

type Props = {
  basePath: string // 管理画面のベースパス（/admin or /stpr-10th-anniversary/admin）
  tableKey: string
  id: string
  label: string // 確認用の行ラベル
  /** form ラッパーの追加クラス（SP で幅いっぱいにする等）。 */
  formClassName?: string
  /** ボタンの追加クラス。未指定時はデスクトップ用の小さめスタイル。 */
  className?: string
}

const DEFAULT_BUTTON_CLASS =
  "rounded-full border border-rose-300 px-3 py-1 text-xs text-rose-500 transition-colors hover:bg-rose-50"

/** 削除ボタン。確認ダイアログ後に server action を実行する。 */
export default function DeleteButton({
  basePath,
  tableKey,
  id,
  label,
  formClassName,
  className,
}: Props) {
  return (
    <form
      action={deleteRecord.bind(null, basePath, tableKey, id)}
      className={formClassName}
      onSubmit={(e) => {
        if (!confirm(`「${label}」を削除します。よろしいですか？`)) {
          e.preventDefault()
        }
      }}
    >
      <button type="submit" className={className ?? DEFAULT_BUTTON_CLASS}>
        削除
      </button>
    </form>
  )
}
