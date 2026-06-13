"use client"

import { useRef, useState } from "react"
import { uploadImage, ingestImageUrl } from "@/lib/admin/upload-actions"

/** Supabase Storage 以外の外部 http(s) 画像URLか（取り込み対象）。 */
function isExternalImageUrl(v: string): boolean {
  const s = v.trim()
  return /^https?:\/\//i.test(s) && !s.includes("supabase.co") && !s.includes("/storage/v1/object/")
}

type Props = {
  /** フォーム送信名。制御モード（onChange あり）では省略可。 */
  name?: string
  table: string // アップロードパス用
  initialValue?: string | string[]
  /** 制御モード: 値を親が保持する場合に渡す（単一モードのみ） */
  value?: string
  onChange?: (url: string) => void
  /** プレビューの高さを抑えたいネスト用 */
  compact?: boolean
  /** 複数画像モード（URL配列を JSON で hidden input に書き出す） */
  multiple?: boolean
  /** 複数モードの制御値（repeater 行内などで使用） */
  multiValue?: string[]
  /** 複数モードの制御 onChange（指定時は hidden input を出さない） */
  onMultiChange?: (urls: string[]) => void
}

/**
 * 画像フィールド。
 * - 単一モード: 1枚の画像（text 列）。非制御は name 付き input、制御は value/onChange。
 * - 複数モード（multiple）: 複数画像を一覧表示・個別削除でき、URL配列を JSON 文字列で
 *   hidden input（name）へ書き出す。保存側は text[] 配列へ変換する。
 * パス: {table}/{slug}/{filename}（slug は同フォームの slug 入力から取得）
 */
export default function ImageField(props: Props) {
  if (props.multiple) return <MultiImageField {...props} />
  return <SingleImageField {...props} />
}

/** 同フォームの slug を使って 1 ファイルをアップロードし、公開URLを返す。 */
async function uploadFromForm(
  file: File,
  table: string,
  form: HTMLFormElement | null,
): Promise<{ url?: string; error?: string }> {
  const slugEl = form?.elements.namedItem("slug") as HTMLInputElement | null
  const slug = slugEl?.value?.trim() ?? ""
  const fd = new FormData()
  fd.set("table", table)
  fd.set("slug", slug)
  fd.set("file", file)
  try {
    const res = await uploadImage(fd)
    if (res.error) return { error: res.error }
    return { url: res.url }
  } catch {
    return { error: "アップロード中にエラーが発生しました。" }
  }
}

/* =========================================================================
 * 単一画像モード（従来の挙動）
 * ========================================================================= */
function SingleImageField({ name, table, initialValue, value, onChange, compact }: Props) {
  const controlled = onChange !== undefined
  const initStr = typeof initialValue === "string" ? initialValue : ""
  const [internal, setInternal] = useState(initStr)
  const url = controlled ? (value ?? "") : internal
  const setUrl = (v: string) => {
    if (controlled) onChange!(v)
    else setInternal(v)
  }

  const [uploading, setUploading] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    const res = await uploadFromForm(file, table, e.target.form)
    if (res.error) setError(res.error)
    else if (res.url) setUrl(res.url)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  // URL欄を確定（blur）したとき、外部URLなら Storage に取り込んで差し替える。
  async function handleUrlBlur(v: string) {
    if (!isExternalImageUrl(v)) return
    setError(null)
    setIngesting(true)
    const res = await ingestImageUrl(v)
    if (res.error) setError(res.error)
    else if (res.url) setUrl(res.url)
    setIngesting(false)
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

      {/* 公開URL（手入力可）。非制御モードのみ name を付けてフォーム送信値にする。
          外部URLを入力して確定（blur）すると Storage に取り込み自動差し替え。 */}
      <input
        type="text"
        {...(controlled ? {} : { name })}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={(e) => handleUrlBlur(e.target.value)}
        disabled={ingesting}
        placeholder="https://… もしくは /images/…"
        className="rounded-lg border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100 disabled:opacity-60"
      />

      {ingesting && <p className="text-xs text-gold-700">外部画像を Storage に取り込み中…</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}

/* =========================================================================
 * 複数画像モード（一覧 + 個別削除 + まとめてアップロード）
 * ========================================================================= */
function normalizeToArray(v?: string | string[]): string[] {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
  }
  if (typeof v === "string" && v.trim()) {
    try {
      const a = JSON.parse(v)
      if (Array.isArray(a)) {
        return a.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      }
    } catch {
      // JSON でなければ単一URLとして扱う
    }
    return [v.trim()]
  }
  return []
}

function MultiImageField({ name, table, initialValue, compact, multiValue, onMultiChange }: Props) {
  const controlled = onMultiChange !== undefined
  const [internal, setInternal] = useState<string[]>(() => normalizeToArray(initialValue))
  const urls = controlled ? (multiValue ?? []) : internal
  const setUrls = (next: string[]) => {
    if (controlled) onMultiChange!(next)
    else setInternal(next)
  }

  const [uploading, setUploading] = useState(false)
  const [ingestingIdx, setIngestingIdx] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setError(null)
    setUploading(true)
    const added: string[] = []
    for (const file of files) {
      const res = await uploadFromForm(file, table, e.target.form)
      if (res.error) {
        setError(res.error)
        break
      }
      if (res.url) added.push(res.url)
    }
    if (added.length) setUrls([...urls, ...added])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  const removeAt = (i: number) => setUrls(urls.filter((_, idx) => idx !== i))
  const addByUrl = () => setUrls([...urls, ""])
  const updateAt = (i: number, v: string) =>
    setUrls(urls.map((u, idx) => (idx === i ? v : u)))

  // 行のURL欄を確定（blur）したとき、外部URLなら Storage に取り込んで差し替える。
  async function handleRowBlur(i: number, v: string) {
    if (!isExternalImageUrl(v)) return
    setError(null)
    setIngestingIdx(i)
    const res = await ingestImageUrl(v)
    if (res.error) setError(res.error)
    else if (res.url) updateAt(i, res.url)
    setIngestingIdx(null)
  }

  const cleaned = urls.map((u) => u.trim()).filter((u) => u.length > 0)
  const thumbH = compact ? "h-20" : "h-24"

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
          e.preventDefault()
        }
      }}
      className="flex flex-col gap-3"
    >
      {/* 追加済み画像の一覧（個別削除） */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((u, i) => (
            <div
              key={i}
              className="relative flex flex-col gap-1.5 rounded-xl border border-gold-200 bg-gold-50/30 p-2"
            >
              <div className="relative">
                {u ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u}
                    alt={`画像 ${i + 1}`}
                    className={`${thumbH} w-full rounded-lg border border-gold-200 bg-white object-contain`}
                  />
                ) : (
                  <div
                    className={`flex ${thumbH} w-full items-center justify-center rounded-lg border border-dashed border-gold-200 bg-white/60 text-[11px] text-[#9a8aa0]`}
                  >
                    URL未入力
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`画像 ${i + 1} を削除`}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-rose-300 bg-white text-sm leading-none text-rose-500 shadow-sm transition-colors hover:bg-rose-50"
                >
                  ×
                </button>
              </div>
              {/* URL 手入力/確認（外部URLは確定時に Storage へ取り込み差し替え） */}
              <input
                type="text"
                value={u}
                onChange={(e) => updateAt(i, e.target.value)}
                onBlur={(e) => handleRowBlur(i, e.target.value)}
                disabled={ingestingIdx === i}
                placeholder="https://…"
                className="w-full rounded-md border border-gold-200 bg-white px-2 py-1 text-[11px] outline-none focus:border-gold-400 disabled:opacity-60"
              />
              {ingestingIdx === i && <span className="text-[10px] text-gold-700">取り込み中…</span>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-full border border-gold-300 bg-white px-4 py-1.5 text-xs text-gold-700 transition-colors hover:bg-gold-50 disabled:opacity-50"
        >
          {uploading ? "アップロード中…" : "＋ 画像を追加（複数選択可）"}
        </button>
        <button
          type="button"
          onClick={addByUrl}
          className="rounded-full border border-gold-200 px-4 py-1.5 text-xs text-[#6a5570] transition-colors hover:bg-gold-50"
        >
          URLで追加
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {/* 保存値: URL配列の JSON 文字列（非制御モードのみ。制御時は親が値を保持） */}
      {!controlled && <input type="hidden" name={name} value={JSON.stringify(cleaned)} />}

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
