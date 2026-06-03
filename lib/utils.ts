// 純粋関数ユーティリティ。
// データ取得（Supabase 読み取り）は lib/repo.ts に分離している。
// メンバーは固定データのため data/members.ts を直接参照する。

import { MEMBERS, type Member } from "@/data/members"
import type { LiveStatus, Venue } from "@/data/lives"

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
 * "2026-06-04" → "2026.06.04" のドット区切りに整形する（一覧の日付メタ用）。
 * パースできない文字列はそのまま返す。既存ファンサイトの表記に合わせている。
 */
export function formatDateDot(dateStr?: string): string {
  if (!dateStr) return ""
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr)
  if (!m) return dateStr
  const [, y, mo, d] = m
  return `${y}.${mo.padStart(2, "0")}.${d.padStart(2, "0")}`
}

/**
 * 期間（開始〜終了）を表示用文字列にする。
 * ISO日付（YYYY-MM-DD…）はドット区切りに整形し、自由文字列はそのまま使う。
 * lives（datetime）/ events（自由文字列）双方で利用する。
 */
export function formatPeriod(start?: string, end?: string): string {
  if (!start) return end ? formatDateDot(end) : ""
  const s = formatDateDot(start)
  if (end && end !== start) return `${s} 〜 ${formatDateDot(end)}`
  return s
}

/**
 * YouTube の動画 ID からサムネイル URL を生成する。
 */
export function getYoutubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
}

/**
 * YouTube のフル URL（watch?v= / youtu.be/ / embed/）から動画 ID を抽出する。
 * 取れない場合は undefined。
 */
export function extractYoutubeId(url?: string): string | undefined {
  if (!url) return undefined
  const m = url.match(
    /(?:youtu\.be\/|watch\?v=|\/embed\/|\/v\/|\/shorts\/)([A-Za-z0-9_-]{11})/,
  )
  return m ? m[1] : undefined
}

/** youtubeId / youtubeUrl どちらからでもサムネイル URL を得る。 */
export function resolveYoutubeThumbnail(
  youtubeId?: string,
  youtubeUrl?: string,
): string | undefined {
  const id = youtubeId || extractYoutubeId(youtubeUrl)
  return id ? getYoutubeThumbnail(id) : undefined
}

/** 並び順（新しい順 / 古い順）。 */
export type SortOrder = "newest" | "oldest"
/** 一覧の表示モード（グリッド / リスト）。 */
export type ViewMode = "grid" | "list"

/** 日付文字列（ISO もしくは "2026-..." 等）から 4 桁の年を取り出す。無ければ "不明"。 */
export function pickYear(dateStr?: string | null): string {
  if (!dateStr) return "不明"
  const m = String(dateStr).match(/\d{4}/)
  return m ? m[0] : "不明"
}

/**
 * 配列を「年」でグルーピングし、各グループ内も日付でソートして返す。
 * 既存ファンサイトの年代別一覧と同じ挙動。"不明" は末尾に回す。
 */
export function groupByYear<T>(
  items: T[],
  getDate: (item: T) => string | undefined | null,
  sort: SortOrder = "newest",
): Array<{ year: string; items: T[] }> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const year = pickYear(getDate(item))
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(item)
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => {
      const cmp = (getDate(a) ?? "").localeCompare(getDate(b) ?? "")
      return sort === "newest" ? -cmp : cmp
    })
  }
  const years = [...map.keys()]
    .filter((y) => y !== "不明")
    .sort((a, b) => (sort === "newest" ? Number(b) - Number(a) : Number(a) - Number(b)))
  if (map.has("不明")) years.push("不明")
  return years.map((year) => ({ year, items: map.get(year)! }))
}

/** メンバー（固定データ）を id から取得する。 */
export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id)
}

/**
 * 会場を表示用文字列に整形する（fansite 互換構造）。
 * 例: "東京 東京ドーム（メインステージ）"
 */
export function formatVenueName(v: Venue): string {
  const place = v.stageName ?? v.venueName ?? ""
  const label = v.stageName && v.venueName ? `（${v.venueName}）` : ""
  return [v.prefecture, place + label].filter(Boolean).join(" ")
}

/** 会場配列を " / " 連結した一覧表示用文字列にする。 */
export function venuesSummary(venues: Venue[]): string {
  return venues.map(formatVenueName).join(" / ")
}
