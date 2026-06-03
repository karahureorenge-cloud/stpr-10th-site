"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "./auth-actions"

/** Storage のバケット名（Public） */
const BUCKET = "media"

export type UploadResult = { url?: string; error?: string }

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
  if (!slugRaw) {
    return { error: "先に「スラッグ（URL）」を入力してから画像を選択してください。" }
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "ファイルが選択されていません。" }
  }
  if (!file.type.startsWith("image/")) {
    return { error: "画像ファイルを選択してください。" }
  }
  // 10MB 上限。
  if (file.size > 10 * 1024 * 1024) {
    return { error: "画像サイズは 10MB 以下にしてください。" }
  }

  const slug = slugRaw.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "item"
  const path = `${table}/${slug}/${sanitizeFilename(file.name)}`

  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Supabase 設定エラー" }
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
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
