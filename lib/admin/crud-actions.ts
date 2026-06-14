"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { getTableConfig, type Field } from "@/lib/admin/tables"
import { assertAdmin } from "@/lib/admin/auth-actions"
import { loadRecordById } from "@/lib/admin/record-source"
import { logChange, scopeOf } from "@/lib/admin/change-log"
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
export type ActionResult = { error?: string; ok?: boolean }

/** publish_status を draft/published に正規化する（ボタン由来の hidden 値）。 */
function parsePublishStatus(formData: FormData): "draft" | "published" {
  return String(formData.get("publish_status") ?? "draft") === "published" ? "published" : "draft"
}

/** diff 用に値をコンパクト化（巨大な jsonb はプレースホルダに）。 */
function snapshot(v: unknown): unknown {
  try {
    const s = JSON.stringify(v ?? null)
    return s.length > 1000 ? "[large]" : (v ?? null)
  } catch {
    return String(v)
  }
}
function stable(v: unknown): string {
  try {
    return JSON.stringify(v ?? null)
  } catch {
    return String(v)
  }
}

/** 旧行と新レコードを比較し、変わったキーだけ before/after を返す。 */
function computeDiff(
  oldRow: Record<string, unknown> | undefined,
  newRec: Record<string, unknown>,
): { before: Record<string, unknown>; after: Record<string, unknown> } {
  const before: Record<string, unknown> = {}
  const after: Record<string, unknown> = {}
  for (const k of Object.keys(newRec)) {
    if (stable(oldRow?.[k]) !== stable(newRec[k])) {
      before[k] = snapshot(oldRow?.[k])
      after[k] = snapshot(newRec[k])
    }
  }
  return { before, after }
}

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

    case "date":
    case "datetime": {
      // datetime-local は "YYYY-MM-DDTHH:mm"。空は null。
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

/** スキーマ全体を変換して 1 レコード分のオブジェクトを作る。
 *  enforceRequired=false（下書き保存・プレビュー）のときは必須チェックを行わない。 */
function buildRecord(
  tableKey: string,
  formData: FormData,
  enforceRequired = true,
): Record<string, unknown> {
  const cfg = getTableConfig(tableKey)
  if (!cfg) throw new Error("不明なテーブルです。")

  const record: Record<string, unknown> = {}
  for (const field of cfg.fields) {
    const value = parseField(field, formData)
    if (enforceRequired && field.required && (value === null || value === "")) {
      throw new Error(`「${field.label}」は必須です（公開する場合は入力してください）。`)
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
    const record = buildRecord("lives", formData, false)
    applyLiveStatus(record)
    // プレビューでは非公開（下書き）でも中身を確認したいので、そのまま描画する。
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

  // 公開状態は公開ボタン（hidden publish_status）で決定。下書きは必須未入力でも保存可。
  const publishStatus = parsePublishStatus(formData)
  let record: Record<string, unknown>
  try {
    record = buildRecord(tableKey, formData, publishStatus === "published")
  } catch (e) {
    return { error: e instanceof Error ? e.message : "入力エラー" }
  }
  record.publish_status = publishStatus

  // lives は管理画面のスコープで is_10th を自動設定する
  // （/admin=非公式ファンサイト=false / /stpr-10th-anniversary/admin=10周年=true）。
  // status は period_start / period_end から自動計算して上書きする。
  if (tableKey === "lives") {
    record.is_10th = basePath.startsWith("/stpr-10th-anniversary")
    applyLiveStatus(record)
  }

  const supabase = createAdminClient()
  // .select() で挿入行を取得。0行（RLSで弾かれ等）なら無言失敗をエラー化。
  const { data, error } = await supabase.from(tableKey).insert(record).select("id")
  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return { error: "保存できませんでした（書き込み権限がありません）。サーバーの SUPABASE_SECRET_KEY が secret(service-role) キーか確認してください。" }
  }

  const cfg = getTableConfig(tableKey)
  await logChange({
    table: tableKey,
    recordId: String((data[0] as { id: string }).id),
    changedBy: scopeOf(basePath),
    action: "create",
    diff: {
      title: cfg ? record[cfg.titleField] ?? null : null,
      publish_status: record.publish_status,
    },
  })

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

  // 下書きは必須未入力でも保存可。公開時のみ必須チェック。
  const publishStatus = parsePublishStatus(formData)
  let record: Record<string, unknown>
  try {
    record = buildRecord(tableKey, formData, publishStatus === "published")
  } catch (e) {
    return { error: e instanceof Error ? e.message : "入力エラー" }
  }
  record.publish_status = publishStatus

  // 差分・公開遷移の判定のため旧行を取得。
  const { data: oldRow } = await loadRecordById(tableKey, id)

  if (tableKey === "lives") {
    // is_10th は既存値を維持する。非公式管理から 10周年ライブを編集しても
    // 10周年（is_10th=true）から外さない。新規作成時のみスコープで決まる。
    record.is_10th =
      typeof oldRow?.is_10th === "boolean"
        ? oldRow.is_10th
        : basePath.startsWith("/stpr-10th-anniversary")
    applyLiveStatus(record)
  }

  const supabase = createAdminClient()
  // .select() で更新行を取得。0行（RLSで弾かれ/対象なし）なら無言失敗をエラー化。
  const { data, error } = await supabase.from(tableKey).update(record).eq("id", id).select("id")
  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return { error: "更新が反映されませんでした（対象が無いか、書き込み権限がありません）。サーバーの SUPABASE_SECRET_KEY が secret(service-role) キーか確認してください。" }
  }

  // 公開状態の遷移で action を決定。
  const oldPS = typeof oldRow?.publish_status === "string" ? oldRow.publish_status : undefined
  const newPS = record.publish_status as string
  const action =
    oldPS !== newPS ? (newPS === "published" ? "publish" : "unpublish") : "update"

  await logChange({
    table: tableKey,
    recordId: id,
    changedBy: scopeOf(basePath),
    action,
    diff: computeDiff(oldRow, record),
  })

  revalidatePath(`${basePath}/${tableKey}`)
  redirect(`${basePath}/${tableKey}`)
}

/** ソフト削除（ゴミ箱へ）。理由必須。物理削除はしない。 */
export async function softDeleteRecord(
  basePath: string,
  tableKey: string,
  id: string,
  reason: string,
): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が切れています。再度ログインしてください。" }
  }

  const trimmed = (reason ?? "").trim()
  if (!trimmed) return { error: "削除理由を入力してください。" }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(tableKey)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: "削除できませんでした（対象が無いか権限不足）。" }

  await logChange({
    table: tableKey,
    recordId: id,
    changedBy: scopeOf(basePath),
    action: "delete",
    diff: { reason: trimmed },
  })

  revalidatePath(`${basePath}/${tableKey}`)
  revalidatePath(`${basePath}/trash`)
  return { ok: true }
}

/** ゴミ箱から復元。 */
export async function restoreRecord(
  basePath: string,
  tableKey: string,
  id: string,
): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が切れています。再度ログインしてください。" }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from(tableKey).update({ deleted_at: null }).eq("id", id)
  if (error) return { error: error.message }

  await logChange({
    table: tableKey,
    recordId: id,
    changedBy: scopeOf(basePath),
    action: "restore",
  })

  revalidatePath(`${basePath}/trash`)
  revalidatePath(`${basePath}/${tableKey}`)
  return { ok: true }
}

/** 完全削除（物理削除）。ゴミ箱からのみ実行する想定。 */
export async function hardDeleteRecord(
  basePath: string,
  tableKey: string,
  id: string,
): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が切れています。再度ログインしてください。" }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from(tableKey).delete().eq("id", id)
  if (error) return { error: error.message }

  await logChange({
    table: tableKey,
    recordId: id,
    changedBy: scopeOf(basePath),
    action: "hard_delete",
  })

  revalidatePath(`${basePath}/trash`)
  return { ok: true }
}

/** 一括: 公開状態を変更（published / draft）。 */
export async function bulkSetPublish(
  basePath: string,
  tableKey: string,
  ids: string[],
  status: "published" | "draft",
): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が切れています。再度ログインしてください。" }
  }
  if (!ids?.length) return { error: "対象が選択されていません。" }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from(tableKey)
    .update({ publish_status: status })
    .in("id", ids)
  if (error) return { error: error.message }

  const action = status === "published" ? "publish" : "unpublish"
  await Promise.all(
    ids.map((id) =>
      logChange({ table: tableKey, recordId: id, changedBy: scopeOf(basePath), action }),
    ),
  )

  revalidatePath(`${basePath}/${tableKey}`)
  return { ok: true }
}

/** 一括: ゴミ箱へ移動。理由必須。 */
export async function bulkTrash(
  basePath: string,
  tableKey: string,
  ids: string[],
  reason: string,
): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が切れています。再度ログインしてください。" }
  }
  if (!ids?.length) return { error: "対象が選択されていません。" }
  const trimmed = (reason ?? "").trim()
  if (!trimmed) return { error: "削除理由を入力してください。" }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from(tableKey)
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids)
  if (error) return { error: error.message }

  await Promise.all(
    ids.map((id) =>
      logChange({
        table: tableKey,
        recordId: id,
        changedBy: scopeOf(basePath),
        action: "delete",
        diff: { reason: trimmed },
      }),
    ),
  )

  revalidatePath(`${basePath}/${tableKey}`)
  revalidatePath(`${basePath}/trash`)
  return { ok: true }
}
