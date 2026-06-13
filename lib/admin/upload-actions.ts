"use server"

import { createHash } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth-actions"

/** Storage のバケット名（Public） */
const BUCKET = "media"

/** 受け付ける画像 MIME タイプ。 */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
])

export type UploadResult = { url?: string; error?: string }

/** スラッグ未入力時に使うユニークなパスセグメントを生成する。 */
function uniqueSegment(): string {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  } catch {
    // crypto 不可環境はタイムスタンプ + ランダムにフォールバック
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/** 拡張子 → MIME タイプ（file.type が空のブラウザ向けフォールバック）。 */
const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
}

/** ファイル名の拡張子（小文字・記号除去）を返す。 */
function fileExt(name: string): string {
  const dot = name.lastIndexOf(".")
  return dot >= 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : ""
}

/** PNG/JPEG/WebP/GIF か判定（MIME 優先、空なら拡張子で判定）。 */
function isAllowedImage(file: File): boolean {
  if (file.type) return ALLOWED_IMAGE_TYPES.has(file.type)
  return EXT_TO_MIME[fileExt(file.name)] !== undefined
}

/** アップロードに使う Content-Type を決める（MIME 優先、空なら拡張子から推定）。 */
function resolveContentType(file: File): string {
  if (file.type && ALLOWED_IMAGE_TYPES.has(file.type)) return file.type
  return EXT_TO_MIME[fileExt(file.name)] ?? "application/octet-stream"
}

/** ファイル名を Storage キーに安全な形へ整形（拡張子は保持）。 */
function sanitizeFilename(name: string): string {
  const dot = name.lastIndexOf(".")
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : ""
  const baseRaw = dot >= 0 ? name.slice(0, dot) : name
  const base =
    baseRaw
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file"
  return ext ? `${base}.${ext}` : base
}

/**
 * 画像を Supabase Storage（media バケット）へアップロードし、公開 URL を返す。
 * パス: {table}/{slug}/{filename}
 *
 * クライアント（ImageField）から直接呼ぶ server action。
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が必要です。再度ログインしてください。" }
  }

  const table = String(formData.get("table") ?? "").trim()
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const file = formData.get("file")

  if (!table) return { error: "テーブルが不明です。" }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "ファイルが選択されていません。" }
  }
  // PNG / JPEG / WebP / GIF のみ許可。type が空でも拡張子で判定する。
  if (!isAllowedImage(file)) {
    return { error: "対応形式は PNG・JPEG・WebP・GIF です。" }
  }
  // 10MB 上限。
  if (file.size > 10 * 1024 * 1024) {
    return { error: "画像サイズは 10MB 以下にしてください。" }
  }

  // スラッグがあればそれを、無ければユニークセグメントをパスに使う。
  // （保存されるのは絶対公開URLなので、後でスラッグを設定しても影響しない）
  const slug = slugRaw
    ? slugRaw.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "item"
    : `_${uniqueSegment()}`
  // ファイル名にユニークセグメントを付与し、同名ファイルでもパスが衝突しないようにする。
  // （複数画像アップロード時に 2 枚目以降が 1 枚目を上書きして同じ URL になるのを防ぐ）
  const path = `${table}/${slug}/${uniqueSegment()}-${sanitizeFilename(file.name)}`

  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Supabase 設定エラー" }
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: resolveContentType(file),
    cacheControl: "3600",
  })
  if (error) {
    return {
      error: `アップロード失敗: ${error.message}（Storage に「${BUCKET}」バケット（Public）が作成済みか確認してください）`,
    }
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) return { error: "公開URLの取得に失敗しました。" }
  return { url: data.publicUrl }
}

/* =========================================================================
 * 外部画像URLの取り込み（fetch → media バケットへ保存 → 公開URLへ差し替え）
 * ========================================================================= */

/** content-type（image/xxx）→ 拡張子。未対応は null。 */
function extFromContentType(ct: string): string | null {
  if (!ct.startsWith("image/")) return null
  const sub = ct.slice(6)
  const map: Record<string, string> = { png: "png", jpeg: "jpg", jpg: "jpg", webp: "webp", gif: "gif", avif: "avif" }
  return map[sub] ?? null
}

/** URL の拡張子から画像形式を推定。未対応は null。 */
function extFromUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname.toLowerCase()
    const m = /\.(png|jpe?g|webp|gif|avif)(?:$|[?#])/.exec(path)
    if (!m) return null
    return m[1].startsWith("jp") ? "jpg" : m[1]
  } catch {
    return null
  }
}

/** 拡張子 → アップロード用 content-type。 */
function extToContentType(ext: string): string {
  const map: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif" }
  return map[ext] ?? "application/octet-stream"
}

/** Supabase Storage の URL か（取り込み済み）。 */
function isStorageUrl(url: string): boolean {
  return url.includes("supabase.co") || url.includes("/storage/v1/object/")
}

/** SSRF対策：ループバック/リンクローカル/プライベートIP/localhost を拒否する。 */
function isBlockedHost(rawUrl: string): boolean {
  let host: string
  try {
    host = new URL(rawUrl).hostname.toLowerCase().replace(/^\[|\]$/g, "")
  } catch {
    return true
  }
  if (host === "localhost" || host.endsWith(".localhost")) return true
  // IPv6 ループバック / リンクローカル / ユニークローカル
  if (host === "::1" || host.startsWith("fe80") || host.startsWith("fc") || host.startsWith("fd")) return true
  // IPv4 リテラル
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
  if (m) {
    const a = Number(m[1])
    const b = Number(m[2])
    if (a === 0 || a === 127 || a === 10) return true
    if (a === 169 && b === 254) return true // リンクローカル（クラウドメタデータ 169.254.169.254 を含む）
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
  }
  return false
}

/**
 * 外部画像URLを media バケットへ取り込み、公開URLへ差し替える server action。
 * - 既に Supabase Storage の URL / 非 http(s)（ローカルパス等）はそのまま返す（処理しない）。
 * - 取得した画像を `ingested/{sha256(url)24桁}.{ext}` に upsert 保存（同一URLは重複しない）。
 * 失敗時は元URLは変えず error を返す（呼び出し側で元URLを保持する想定）。
 */
export async function ingestImageUrl(rawUrl: string): Promise<UploadResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が必要です。再度ログインしてください。" }
  }

  const url = (rawUrl ?? "").trim()
  if (!url) return { url: "" }
  // http(s) 以外（/images/… 等のローカルパス）は対象外。
  if (!/^https?:\/\//i.test(url)) return { url }
  // 既に Supabase Storage のURLなら処理しない。
  if (isStorageUrl(url)) return { url }

  // SSRF対策：内部/ループバック/プライベートホストは弾く。
  if (isBlockedHost(url)) return { error: "このホストからは取り込めません（内部/プライベートアドレス）。" }

  let res: Response
  try {
    // リダイレクトは追跡しない（リダイレクト経由のSSRFを防ぐ）。
    res = await fetch(url, { redirect: "manual" })
  } catch {
    return { error: "画像の取得に失敗しました（URLを確認してください）。" }
  }
  // 3xx（リダイレクト）は追跡せずエラー。最終URLを直接指定してもらう。
  if (res.status >= 300 && res.status < 400) {
    return { error: "リダイレクトされるURLは取り込めません。画像の直接URLを指定してください。" }
  }
  if (!res.ok) return { error: `画像の取得に失敗しました（HTTP ${res.status}）。` }

  // Content-Length が上限超過なら全文ダウンロード前に弾く（OOM対策）。
  const declared = Number(res.headers.get("content-length") ?? "")
  if (Number.isFinite(declared) && declared > 10 * 1024 * 1024) {
    return { error: "画像サイズは 10MB 以下にしてください。" }
  }

  const ct = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase()
  const ext = extFromContentType(ct) ?? extFromUrl(url)
  if (!ext) return { error: "対応形式は PNG・JPEG・WebP・GIF・AVIF です。" }

  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.byteLength === 0) return { error: "空の画像です。" }
  if (buf.byteLength > 10 * 1024 * 1024) return { error: "画像サイズは 10MB 以下にしてください。" }

  // 元URLのハッシュをファイル名に使い、同一URLの重複保存を防ぐ。
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 24)
  const path = `ingested/${hash}.${ext}`

  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Supabase 設定エラー" }
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    upsert: true,
    contentType: extToContentType(ext),
    cacheControl: "3600",
  })
  if (error) return { error: `取り込み保存に失敗しました: ${error.message}` }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) return { error: "公開URLの取得に失敗しました。" }
  return { url: data.publicUrl }
}
