// 純粋関数ユーティリティ。
// データ取得（Supabase 読み取り）は lib/repo.ts に分離している。
// メンバーは固定データのため data/members.ts を直接参照する。

import { MEMBERS, type Member } from "@/data/members"
import type { Live, LiveStatus, Venue } from "@/data/lives"
import type { Event } from "@/data/events"
import type { Goods } from "@/data/goods"
import type { Magazine } from "@/data/magazines"
import type { Media } from "@/data/media"

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
 * 今日から指定日までの残り日数。過去/不正な日付なら null。
 * カウントダウン表示用（force-dynamic ページでサーバー描画）。
 */
export function getDaysUntil(dateStr?: string): number | null {
  if (!dateStr) return null
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr)
  if (!m) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Math.round((target.getTime() - today.getTime()) / 86400000)
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

// =========================================================================
// HISTORY 年表（buildTimeline）
//   lives / events / goods / songs / albums を年表アイテムへ集約する。
// =========================================================================

export type TimelineCategory =
  | "anniversary"
  | "live"
  | "event"
  | "goods"
  | "magazine"
  | "media"

export type TimelineItem = {
  date: string // YYYY-MM-DD
  year: number
  endDate?: string
  category: TimelineCategory
  title: string
  description?: string
  href: string
}

const TIMELINE_BASE = "/stpr-10th-anniversary"

/** 各種日付文字列（ISO / 区切り / 和暦）を YYYY-MM-DD に正規化。失敗時 null。 */
function normalizeTimelineDate(raw?: string): string | null {
  if (!raw) return null
  const s = String(raw).trim()
  let m = s.match(/(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`
  m = s.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/)
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`
  return null
}

/**
 * lives / events / goods / magazines / media を年表アイテムへ集約する。
 * - 日付は各データの代表日（live/event=periodStart, goods/magazine=releaseDate,
 *   media=dateLabel）を正規化して使用。
 * - すとぷり 10周年（2026-06-04）を DB 非依存の固定エントリとして必ず追加。
 * - 日付昇順（古い→新しい。同日はカテゴリ順）で返す。
 */
export function buildTimeline(opts: {
  lives?: Live[]
  events?: Event[]
  goods?: Goods[]
  magazines?: Magazine[]
  media?: Media[]
}): TimelineItem[] {
  const out: TimelineItem[] = []

  const push = (
    raw: string | undefined,
    base: Omit<TimelineItem, "date" | "year" | "endDate">,
    rawEnd?: string,
  ) => {
    const date = normalizeTimelineDate(raw)
    if (!date) return
    const year = Number(date.slice(0, 4))
    let endDate: string | undefined
    if (rawEnd) {
      const e = normalizeTimelineDate(rawEnd)
      if (e && e !== date) endDate = e
    }
    out.push({ ...base, date, year, endDate })
  }

  // 固定エントリ: すとぷり 10周年（データベース非依存）
  out.push({
    date: "2026-06-04",
    year: 2026,
    category: "anniversary",
    title: "すとぷり 10周年",
    href: "#",
  })

  for (const l of opts.lives ?? []) {
    push(
      l.periodStart,
      { category: "live", title: l.title, description: l.description, href: `${TIMELINE_BASE}/live/${l.slug}` },
      l.periodEnd,
    )
  }
  for (const e of opts.events ?? []) {
    push(
      e.periodStart,
      { category: "event", title: e.title, description: e.description, href: `${TIMELINE_BASE}/event/${e.slug}` },
      e.periodEnd,
    )
  }
  for (const g of opts.goods ?? []) {
    push(g.releaseDate, {
      category: "goods",
      title: g.title,
      description: g.description,
      href: `${TIMELINE_BASE}/goods/${g.slug}`,
    })
  }
  for (const m of opts.magazines ?? []) {
    push(m.releaseDate, {
      category: "magazine",
      title: m.name,
      description: m.issue,
      href: `${TIMELINE_BASE}/magazine/${m.id}`,
    })
  }
  for (const m of opts.media ?? []) {
    push(m.dateLabel, {
      category: "media",
      title: m.programName,
      description: m.station,
      href: "#",
    })
  }

  const catOrder: Record<TimelineCategory, number> = {
    anniversary: 0,
    live: 1,
    event: 2,
    goods: 3,
    magazine: 4,
    media: 5,
  }
  out.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return catOrder[a.category] - catOrder[b.category]
  })
  return out
}
