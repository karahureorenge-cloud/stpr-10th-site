import { createAdminClient } from "@/lib/supabase/admin"
import { logChange } from "@/lib/admin/change-log"
import { TABLE_KEYS } from "@/lib/admin/tables"

export const dynamic = "force-dynamic"

// 予約公開バッチ。Vercel Cron から定期実行される。
// publish_at <= now() の下書き（draft・未削除）を published に切り替える。
// 認可は Authorization: Bearer ${CRON_SECRET}（Vercel Cron が自動付与）。
export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return Response.json({ ok: false, error: "CRON_SECRET 未設定" }, { status: 500 })
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const now = new Date().toISOString()
  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Supabase 設定エラー" },
      { status: 500 },
    )
  }

  const published: Record<string, number> = {}
  let total = 0

  for (const table of TABLE_KEYS) {
    // 対象 id を先に取得（履歴記録のため）。
    const { data: targets, error: selErr } = await supabase
      .from(table)
      .select("id")
      .eq("publish_status", "draft")
      .is("deleted_at", null)
      .not("publish_at", "is", null)
      .lte("publish_at", now)
    if (selErr || !targets || targets.length === 0) continue

    const ids = (targets as { id: string }[]).map((r) => String(r.id))
    const { error: updErr } = await supabase
      .from(table)
      .update({ publish_status: "published" })
      .in("id", ids)
    if (updErr) continue

    await Promise.all(
      ids.map((id) =>
        logChange({ table, recordId: id, changedBy: "cron", action: "publish" }),
      ),
    )
    published[table] = ids.length
    total += ids.length
  }

  return Response.json({ ok: true, total, published, ranAt: now })
}
