"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { getTableConfig, type Field } from "@/lib/admin/tables"
import { assertAdmin } from "./auth-actions"

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

    case "date": {
      const s = String(raw ?? "").trim()
      return s === "" ? null : s
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

/** 新規作成。bind(null, tableKey) で使う。 */
export async function createRecord(
  tableKey: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin()

  let record: Record<string, unknown>
  try {
    record = buildRecord(tableKey, formData)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "入力エラー" }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from(tableKey).insert(record)
  if (error) return { error: error.message }

  revalidatePath(`/admin/${tableKey}`)
  redirect(`/admin/${tableKey}`)
}

/** 更新。bind(null, tableKey, id) で使う。 */
export async function updateRecord(
  tableKey: string,
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin()

  let record: Record<string, unknown>
  try {
    record = buildRecord(tableKey, formData)
  } catch (e) {
    return { error: e instanceof Error ? e.message : "入力エラー" }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from(tableKey).update(record).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/${tableKey}`)
  redirect(`/admin/${tableKey}`)
}

/** 削除。bind(null, tableKey, id) で使う。 */
export async function deleteRecord(tableKey: string, id: string): Promise<void> {
  await assertAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from(tableKey).delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/${tableKey}`)
}
