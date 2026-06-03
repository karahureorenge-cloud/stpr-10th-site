// 純粋関数ユーティリティ。
// データ取得（Supabase 読み取り）は lib/repo.ts に分離している。
// メンバーは固定データのため data/members.ts を直接参照する。

import { MEMBERS, type Member } from "@/data/members"
import type { LiveStatus } from "@/data/lives"

/**
 * ライブのステータスを日付から判定する。
 * - startDate より前: "coming"
 * - startDate 〜 endDate（endDate 省略時は startDate 当日）: "ongoing"
 * - endDate を過ぎた: "finished"
 *
 * 日付が無い場合は "coming" を返す（情報未確定の扱い）。
 * 比較は日単位（時刻を切り捨て）で行う。
 */
export function getLiveStatus(startDate?: string, endDate?: string): LiveStatus {
  if (!startDate) return "coming"

  const today = startOfDay(new Date())
  const start = startOfDay(new Date(startDate))
  const end = startOfDay(new Date(endDate ?? startDate))

  if (today < start) return "coming"
  if (today > end) return "finished"
  return "ongoing"
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * "2026-06-04" → "2026年6月4日" に整形する。
 * パースできない文字列はそのまま返す。
 */
export function formatDate(dateStr: string): string {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr)
  if (!m) return dateStr
  const [, y, mo, d] = m
  return `${Number(y)}年${Number(mo)}月${Number(d)}日`
}

/**
 * YouTube の動画 ID からサムネイル URL を生成する。
 */
export function getYoutubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
}

/** メンバー（固定データ）を id から取得する。 */
export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id)
}
