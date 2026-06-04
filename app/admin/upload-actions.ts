"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "./auth-actions"

/** Storage のバケット名（Public） */
const BUCKET = "media"

/** 受け付ける画像 MIME タイプ。 */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
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
  const path = `${table}/${slug}/${sanitizeFilename(file.name)}`

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
