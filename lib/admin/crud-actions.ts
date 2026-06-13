"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { getTableConfig, type Field } from "@/lib/admin/tables"
import { assertAdmin } from "@/lib/admin/auth-actions"
import { getLiveStatus } from "@/lib/utils"
import { toLive } from "@/lib/repo"
import type { Live } from "@/data/lives"

/** lives の status を period_start / period_end から自動計算してレコードに設定する。 */
function applyLiveStatus(record: Record<string, unknown>): void {
  const ps = typeof record.period_start === "string" ? record.period_start : undefined
  const pe = typeof record.period_end === "string" ? record.period_end : undefined
  record.status = getLiveStatus(ps, pe)
}

export type FormState = { error?: string }

/** FormData の 1 フィールドをスキーマに従って DB 値へ変換する。 */
function parseField(field: Field, formData: FormData): unknown {
  const raw = formData.get(field.name)

  switch (field.type) {
    case "boolean":
      // チェックボックス: 値があれば true。
      return raw != null && raw !== ""

    case "number": {
      const n = Number(String(raw ?? "").trim())
      return Number.isFinite(n) ? n : 0
    }

    case "csv": {
      const s = String(raw ?? "").trim()
      if (!s) return []
      return s
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
    }

    case "multiselect": {
      // <select multiple> は同名で複数値を送る → text[] へ。
      return formData
        .getAll(field.name)
        .map((v) => String(v))
        .filter((v) => v.length > 0)
    }

    case "json":
    case "repeater": {
      const s = String(raw ?? "").trim()
      if (!s) return []
      try {
        return JSON.parse(s)
      } catch {
        throw new Error(`「${field.label}」の入力が不正です。`)
      }
    }

    case "imagelist": {
      // ImageListField が JSON 文字列（URL配列）を hidden input に書き出す → text[] へ。
      const s = String(raw ?? "").trim()
      if (!s) return []
      try {
        const arr = JSON.parse(s)
        return Array.isArray(arr)
          ? arr.filter((v): v is string => typeof v === "string" && v.length > 0)
          : []
      } catch {
        return []
      }
    }

    case "image": {
      // 複数モード: ImageField が URL配列の JSON を書き出す → text[] へ。
      if (field.multiple) {
        const s = String(raw ?? "").trim()
        if (!s) return []
        try {
          const arr = JSON.parse(s)
          return Array.isArray(arr)
            ? arr.filter((v): v is string => typeof v === "string" && v.length > 0)
            : []
        } catch {
          return []
        }
      }
      // 単一モード: 1枚の URL（text）。
      const s = String(raw ?? "")
      if (field.required) return s
      return s === "" ? null : s
    }

    case "date": {
      const s = String(raw ?? "").trim()
      return s === "" ? null : s
    }

    case "richtext": {
      // Tiptap が出力する HTML をそのまま text 列へ保存。空（空タグのみ）は null。
      const s = String(raw ?? "").trim()
      if (s === "" || s === "<p></p>") return null
      return s
    }

    default: {
      // text / textarea / select
      const s = String(raw ?? "")
      if (field.required) return s
      return s === "" ? null : s
    }
  }
}

/** スキーマ全体を変換して 1 レコード分のオブジェクトを作る。 */
function buildRecord(tableKey: string, formData: FormData): Record<string, unknown> {
  const cfg = getTableConfig(tableKey)
  if (!cfg) throw new Error("不明なテーブルです。")

  const record: Record<string, unknown> = {}
  for (const field of cfg.fields) {
    const value = parseField(field, formData)
    if (field.required && (value === null || value === "")) {
      throw new Error(`「${field.label}」は必須です。`)
    }
    record[field.name] = value
  }
  return record
}

export type LivePreviewState = {
  live?: Live
  /** DB 形（snake_case）の新レコード。保存済みレコードとの差分判定に使う。 */
  record?: Record<string, unknown>
  error?: string
}

/**
 * 保存せずに、フォームの現在値を公開ページ用の Live に変換して返す（lives 専用・プレビュー用）。
 * useActionState から呼ぶ。あわせて DB 形の新レコードも返し、クライアントで保存済みと差分比較する。
 */
export async function buildLivePreview(
  _prevState: LivePreviewState,
  formData: FormData,
): Promise<LivePreviewState> {
  await assertAdmin()
  try {
    const record = buildRecord("lives", formData)
    applyLiveStatus(record)
    // プレビューでは非公開（is_active=false）でも中身を確認したいので、そのまま描画する。
    return { live: toLive(record), record }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "プレビューの生成に失敗しました。" }
  }
}

/** 新規作成。bind(null, basePath, tableKey) で使う。 */
export async function createRecord(
  basePath: string,
  tableKey: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が切れています。再度ログインしてください。" }
  }

  let record: Record<string, unknown>
  try {
    record = buildRecord(tableKey, formData)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "入力エラー" }
  }

  // lives は管理画面のスコープで is_10th を自動設定する
  // （/admin=非公式ファンサイト=false / /stpr-10th-anniversary/admin=10周年=true）。
  // status は period_start / period_end から自動計算して上書きする。
  if (tableKey === "lives") {
    record.is_10th = basePath.startsWith("/stpr-10th-anniversary")
    applyLiveStatus(record)
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from(tableKey).insert(record)
  if (error) return { error: error.message }

  revalidatePath(`${basePath}/${tableKey}`)
  redirect(`${basePath}/${tableKey}`)
}

/** 更新。bind(null, basePath, tableKey, id) で使う。 */
export async function updateRecord(
  basePath: string,
  tableKey: string,
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が切れています。再度ログインしてください。" }
  }

  let record: Record<string, unknown>
  try {
    record = buildRecord(tableKey, formData)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "入力エラー" }
  }

  // lives は管理画面のスコープで is_10th を固定する（編集でも別スコープへ移動させない）。
  // status は period_start / period_end から自動計算して上書きする。
  if (tableKey === "lives") {
    record.is_10th = basePath.startsWith("/stpr-10th-anniversary")
    applyLiveStatus(record)
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from(tableKey).update(record).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath(`${basePath}/${tableKey}`)
  redirect(`${basePath}/${tableKey}`)
}

/** 削除。bind(null, basePath, tableKey, id) で使う。 */
export async function deleteRecord(
  basePath: string,
  tableKey: string,
  id: string,
): Promise<void> {
  await assertAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from(tableKey).delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath(`${basePath}/${tableKey}`)
}
