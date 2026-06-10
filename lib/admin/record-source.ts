import { createAdminClient } from "@/lib/supabase/admin"

/** id でレコードを 1 件取得する（編集フォームの初期値）。 */
export async function loadRecordById(
  table: string,
  id: string,
): Promise<{ data?: Record<string, unknown>; error?: string }> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) return { error: error.message }
    return { data: (data ?? undefined) as Record<string, unknown> | undefined }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "読み込みに失敗しました。" }
  }
}

/** 複製元レコードを取得し、新規フォーム用の初期値に変換する。 */
export async function loadDuplicateSource(
  table: string,
  fromId: string,
  titleField: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase.from(table).select("*").eq("id", fromId).maybeSingle()
    if (!data) return undefined
    const row = { ...(data as Record<string, unknown>) }
    // 自動採番・タイムスタンプは引き継がない。
    delete row.id
    delete row.created_at
    delete row.updated_at
    // slug は空に（重複防止）。
    row.slug = ""
    // タイトルに（コピー）を付与。
    const t = row[titleField]
    if (typeof t === "string" && t) row[titleField] = `${t}（コピー）`
    return row
  } catch {
    return undefined
  }
}
