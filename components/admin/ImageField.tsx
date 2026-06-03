"use client"

import { useRef, useState } from "react"
import { uploadImage } from "@/app/admin/upload-actions"

type Props = {
  /** フォーム送信名。制御モード（onChange あり）では省略可。 */
  name?: string
  table: string // アップロードパス用
  initialValue?: string
  /** 制御モード: 値を親が保持する場合に渡す */
  value?: string
  onChange?: (url: string) => void
  /** プレビューの高さを抑えたいネスト用 */
  compact?: boolean
}

/**
 * 画像フィールド。
 * - 非制御モード: 内部 state を持ち、name 付きテキスト入力でフォーム送信する
 * - 制御モード（onChange 指定）: value/onChange で親が値を保持（RepeaterField のサブ項目用）
 * - 「ファイルを選択」で Storage（media バケット）へアップロード → 公開URLを自動入力
 * - URL があればプレビュー表示
 * パス: {table}/{slug}/{filename}（slug は同フォームの slug 入力から取得）
 */
export default function ImageField({
  name,
  table,
  initialValue,
  value,
  onChange,
  compact,
}: Props) {
  const controlled = onChange !== undefined
  const [internal, setInternal] = useState(initialValue ?? "")
  const url = controlled ? (value ?? "") : internal
  const setUrl = (v: string) => {
    if (controlled) onChange!(v)
    else setInternal(v)
  }

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    // 同じフォーム内の slug 入力値を取得してパスに使う。
    const form = e.target.form
    const slugEl = form?.elements.namedItem("slug") as HTMLInputElement | null
    const slug = slugEl?.value?.trim() ?? ""

    const fd = new FormData()
    fd.set("table", table)
    fd.set("slug", slug)
    fd.set("file", file)

    setUploading(true)
    try {
      const res = await uploadImage(fd)
      if (res.error) setError(res.error)
      else if (res.url) setUrl(res.url)
    } catch {
      setError("アップロード中にエラーが発生しました。")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const previewH = compact ? "h-20" : "h-32"

  return (
    <div className="flex flex-col gap-2">
      {/* プレビュー */}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="プレビュー"
          className={`${previewH} w-auto max-w-full rounded-lg border border-gold-200 bg-white object-contain`}
        />
      ) : (
        <div
          className={`flex ${previewH} w-full items-center justify-center rounded-lg border border-dashed border-gold-200 bg-gold-50/40 text-xs text-[#9a8aa0]`}
        >
          画像未設定
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-full border border-gold-300 bg-white px-4 py-1.5 text-xs text-gold-700 transition-colors hover:bg-gold-50 disabled:opacity-50"
        >
          {uploading ? "アップロード中…" : "ファイルを選択"}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="rounded-full border border-rose-300 px-4 py-1.5 text-xs text-rose-500 transition-colors hover:bg-rose-50"
          >
            クリア
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* 公開URL（手入力可）。非制御モードのみ name を付けてフォーム送信値にする。 */}
      <input
        type="text"
        {...(controlled ? {} : { name })}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://… もしくは /images/…"
        className="rounded-lg border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
      />

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
