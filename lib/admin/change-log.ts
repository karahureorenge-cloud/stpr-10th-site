// サーバー専用モジュール（"use server" ではない＝サーバーアクション集ではない）。
// 管理画面の server action / server component からのみ import する（クライアント不可）。
import { createAdminClient } from "@/lib/supabase/admin"

export type ChangeAction =
  | "create"
  | "update"
  | "publish"
  | "unpublish"
  | "delete"
  | "restore"
  | "hard_delete"

export type ChangeLog = {
  id: string
  table_name: string
  record_id: string
  changed_by: string | null
  changed_at: string
  action: ChangeAction
  diff: unknown
}

/** basePath から操作系統スコープを判定（changed_by に記録）。 */
export function scopeOf(basePath: string): "10th" | "fansite" {
  return basePath.startsWith("/stpr-10th-anniversary") ? "10th" : "fansite"
}

/**
 * 変更履歴を 1 行記録する。ベストエフォート（記録失敗で本処理は止めない）。
 * change_logs テーブル未作成（マイグレーション未実行）でも握りつぶす。
 */
export async function logChange(input: {
  table: string
  recordId: string
  changedBy: string
  action: ChangeAction
  diff?: unknown
}): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from("change_logs").insert({
      table_name: input.table,
      record_id: input.recordId,
      changed_by: input.changedBy,
      action: input.action,
      diff: input.diff ?? null,
    })
  } catch {
    // 履歴記録は補助機能。失敗しても本処理に影響させない。
  }
}

/** 指定レコードの変更履歴を新しい順で取得（履歴パネル用）。 */
export async function loadChangeLogs(table: string, recordId: string): Promise<ChangeLog[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("change_logs")
      .select("*")
      .eq("table_name", table)
      .eq("record_id", recordId)
      .order("changed_at", { ascending: false })
      .limit(100)
    if (error || !data) return []
    return data as ChangeLog[]
  } catch {
    return []
  }
}
