// 純粋関数ユーティリティ。
// データ取得（Supabase 読み取り）は lib/repo.ts に分離している。
// メンバーは固定データのため data/members.ts を直接参照する。

import { MEMBERS, type Member } from "@/data/members"
import type { Live, LiveStatus, Venue } from "@/data/lives"
import type { Event } from "@/data/events"
import type { Goods } from "@/data/goods"
import type { Magazine } from "@/data/magazines"
import type { Media } from "@/data/media"
import type { Stream } from "@/data/streams"
import type { Project } from "@/data/projects"
import type { Song } from "@/data/songs"
import type { Movie } from "@/data/movies"

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

/** チケット受付ステータス（自動計算）。 */
export type TicketSaleStatus = "受付前" | "受付中" | "受付終了"

/** "2026-05-01 10:00" / ISO 文字列を Date に。パース不能・空は null。 */
function parseDateTime(s?: string): Date | null {
  if (!s) return null
  const trimmed = s.trim()
  if (!trimmed) return null
  // "YYYY-MM-DD HH:mm" はスペースを T に正規化してローカル時刻として解釈する。
  const d = new Date(trimmed.replace(" ", "T"))
  return Number.isNaN(d.getTime()) ? null : d
}

/** 和暦混じり日時 "2026年5月3日(日)20:00" → Date（年が無ければ fallbackYear）。 */
function parseJpDateTimePart(s: string, fallbackYear?: number): Date | null {
  const m = /(?:(\d{4})年)?\s*(\d{1,2})月\s*(\d{1,2})日(?:\s*[（(][^）)]*[）)])?\s*(?:(\d{1,2})[:：](\d{2}))?/.exec(s)
  if (!m) return null
  const y = m[1] ? Number(m[1]) : fallbackYear
  if (!y) return null
  const dt = new Date(y, Number(m[2]) - 1, Number(m[3]), m[4] ? Number(m[4]) : 0, m[5] ? Number(m[5]) : 0)
  return Number.isNaN(dt.getTime()) ? null : dt
}

/** 和暦 / スラッシュ / ISO の日時を緩く Date に（年が無ければ fallbackYear）。 */
function parseFlexDateTime(s?: string, fallbackYear?: number): Date | null {
  if (!s) return null
  const jp = parseJpDateTimePart(s, fallbackYear)
  if (jp) return jp
  const m = /(?:(\d{4})[/-])?\s*(\d{1,2})[/-](\d{1,2})(?:[ T](\d{1,2})[:：](\d{2}))?/.exec(s.trim())
  if (!m) return null
  const y = m[1] ? Number(m[1]) : fallbackYear
  if (!y) return null
  const dt = new Date(y, Number(m[2]) - 1, Number(m[3]), m[4] ? Number(m[4]) : 0, m[5] ? Number(m[5]) : 0)
  return Number.isNaN(dt.getTime()) ? null : dt
}

/** 販売期間の自由文字列（"…～…"）から開始・終了 Date を抽出。 */
function parseSalePeriod(period?: string): { start: Date | null; end: Date | null } | null {
  const t = (period ?? "").trim()
  if (!t) return null
  const parts = t
    .split(/[～〜~]|—|–|−/)
    .map((s) => s.trim())
    .filter(Boolean)
  const start = parseFlexDateTime(parts[0])
  const end = parts.length > 1 ? parseFlexDateTime(parts[1], start?.getFullYear()) : null
  if (!start && !end) return null
  return { start, end }
}

/**
 * チケットの受付ステータスを判定する。
 * - 現在 < 開始: "受付前" / 開始〜終了: "受付中" / 現在 > 終了: "受付終了"
 * - saleStart / saleEnd（日時）を優先。空なら salePeriod（販売期間の自由文字列）を解析。
 * - 判定できる日時が一切無ければ undefined（非表示）。
 */
export function getTicketStatus(
  saleStart?: string,
  saleEnd?: string,
  salePeriod?: string,
): TicketSaleStatus | undefined {
  let start = parseDateTime(saleStart)
  let end = parseDateTime(saleEnd)
  if (!start || !end) {
    const p = parseSalePeriod(salePeriod)
    if (p) {
      if (!start) start = p.start
      if (!end) end = p.end
    }
  }
  if (!start && !end) return undefined
  const now = new Date()
  if (start && now < start) return "受付前"
  if (end && now > end) return "受付終了"
  return "受付中"
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

/** 日付文字列（YYYY-MM-DD…）を {y,m,d} に分解。失敗時 null。 */
function parseYmd(dateStr?: string): { y: number; m: number; d: number } | null {
  if (!dateStr) return null
  const m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(String(dateStr).trim())
  if (!m) return null
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) }
}

/** "2026-06-04" → "20260604"（Googleカレンダー用）。失敗時 null。 */
function toCalendarYmd(dateStr?: string): string | null {
  const p = parseYmd(dateStr)
  if (!p) return null
  return `${p.y}${String(p.m).padStart(2, "0")}${String(p.d).padStart(2, "0")}`
}

/** "20260604" を 1 日進めた "YYYYMMDD" を返す（終了日は排他指定のため）。 */
function nextDayCalendarYmd(ymd: string): string {
  const y = Number(ymd.slice(0, 4))
  const m = Number(ymd.slice(4, 6))
  const d = Number(ymd.slice(6, 8))
  const dt = new Date(y, m - 1, d + 1)
  return `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(
    dt.getDate(),
  ).padStart(2, "0")}`
}

/** X（旧Twitter）シェア用の intent URL を組み立てる。 */
export function buildTweetUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
}

/**
 * Googleカレンダー「予定を追加」URL を組み立てる。
 * 日付のみ（時刻なし）の終日予定として扱い、終了日は排他指定（翌日）にする。
 * 開始日が解釈できない場合は null（ボタンを出さない）。
 */
export function buildGoogleCalendarUrl(opts: {
  title: string
  start?: string
  end?: string
  details?: string
  location?: string
}): string | null {
  const startYmd = toCalendarYmd(opts.start)
  if (!startYmd) return null
  const endYmd = toCalendarYmd(opts.end) ?? startYmd
  const dates = `${startYmd}/${nextDayCalendarYmd(endYmd)}`
  const params = new URLSearchParams({ action: "TEMPLATE", text: opts.title, dates })
  if (opts.details) params.set("details", opts.details)
  if (opts.location) params.set("location", opts.location)
  return `https://www.google.com/calendar/render?${params.toString()}`
}

/** Google Maps 埋め込み（iframe src）URL。会場名などをそのままクエリに使う。 */
export function buildMapsEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

/**
 * YouTube の動画 ID からサムネイル URL を生成する。
 * maxresdefault は動画によっては存在しないため、必ず用意される hqdefault を使う。
 */
export function getYoutubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
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

/** カードのアクセント縦線用カラーパレット（ピンク・ラベンダー・スカイブルー・ゴールド・ローズ）。 */
export const ACCENT_PALETTE = [
  "rgba(245, 134, 164, 0.9)", // ピンク
  "rgba(168, 149, 204, 0.9)", // ラベンダー
  "rgba(142, 200, 224, 0.9)", // スカイブルー
  "rgba(232, 200, 120, 0.9)", // ゴールド
  "rgba(232, 122, 122, 0.9)", // ローズ
] as const

/**
 * シード文字列（カードの slug やタイトル）から決定的にアクセントカラーを選ぶ。
 * 文字コードの合計 % パレット数 なので、同じカードは常に同じ色になる。
 */
export function accentColorFromSeed(seed: string): string {
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return ACCENT_PALETTE[sum % ACCENT_PALETTE.length]
}

/** カードのシール風の傾き候補（度）。0 を含めず常に少し傾ける。 */
const TILT_ANGLES = [-2.5, -2, -1.5, -1, 1, 1.5, 2, 2.5] as const

/**
 * シード文字列から決定的に傾き角度（度）を選ぶ。
 * 文字コードの合計 % 角度数 なので、同じカードは常に同じ角度になる。
 * CSS 変数 --tilt に `${rotationFromSeed(slug)}deg` として渡して使う。
 */
export function rotationFromSeed(seed: string): number {
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return TILT_ANGLES[sum % TILT_ANGLES.length]
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
  | "music"
  | "movie"
  | "project"
  | "stream"
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
  // ライブ全体の期間（periodStart〜periodEnd）を表す非表示スパン。
  // カレンダーの「開催中」判定専用で、チップ・リスト・件数には出さない。
  ongoingOnly?: boolean
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
 * lives / events / goods / magazines / media / streams / projects / songs / movies
 * を年表アイテムへ集約する。
 * - ライブは会場公演（venues[].shows[].date）単位で各公演日に1件ずつ展開する
 *   （タイトル「{ライブ名} {会場名}」）。ライブ全体の開始日・終了日では表示しない。
 *   ただし「開催中」判定用に periodStart〜periodEnd の非表示スパン（ongoingOnly）を別途追加。
 * - その他は各データの代表日（event=periodStart, goods/magazine=releaseDate,
 *   media=dateLabel, stream/project/movie=publishDate, song=publishedDate）を正規化して使用。
 * - すとぷり 10周年（2026-06-04）を DB 非依存の固定エントリとして必ず追加。
 * - 日付昇順（古い→新しい。同日はカテゴリ順）で返す。
 */
export function buildTimeline(opts: {
  lives?: Live[]
  events?: Event[]
  goods?: Goods[]
  magazines?: Magazine[]
  media?: Media[]
  streams?: Stream[]
  projects?: Project[]
  songs?: Song[]
  movies?: Movie[]
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
    const href = `${TIMELINE_BASE}/live/${l.slug}`
    // 会場公演（venues[].shows[].date）単位で各公演日に展開。
    let pushed = 0
    for (const v of l.venues ?? []) {
      const venueName = v.venueName || v.stageName
      if (!venueName) continue
      const seen = new Set<string>()
      for (const s of v.shows ?? []) {
        const date = normalizeTimelineDate(s.date)
        if (!date || seen.has(date)) continue
        seen.add(date)
        out.push({ date, year: Number(date.slice(0, 4)), category: "live", title: `${l.title} ${venueName}`, href })
        pushed++
      }
    }
    // 会場公演データが無いライブは periodStart にライブ名のみで1件フォールバック。
    if (pushed === 0) {
      const date = normalizeTimelineDate(l.periodStart)
      if (date) {
        out.push({ date, year: Number(date.slice(0, 4)), category: "live", title: l.title, description: l.description, href })
      }
    }
    // 「開催中」判定用の非表示スパン（periodStart〜periodEnd）。多日程のみ。
    const ds = normalizeTimelineDate(l.periodStart)
    const de = normalizeTimelineDate(l.periodEnd)
    if (ds && de && de !== ds) {
      out.push({ date: ds, year: Number(ds.slice(0, 4)), endDate: de, category: "live", title: l.title, href, ongoingOnly: true })
    }
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
  for (const s of opts.streams ?? []) {
    push(s.publishDate, {
      category: "stream",
      title: s.title,
      description: s.description,
      href: s.url ?? `${TIMELINE_BASE}/stream`,
    })
  }
  for (const p of opts.projects ?? []) {
    push(p.publishDate, {
      category: "project",
      title: p.title,
      description: p.description,
      href: `${TIMELINE_BASE}/project/${p.slug}`,
    })
  }
  for (const s of opts.songs ?? []) {
    push(s.publishedDate, {
      category: "music",
      title: s.title,
      description: s.artist ?? s.description,
      href: `${TIMELINE_BASE}/music/${s.slug}`,
    })
  }
  for (const m of opts.movies ?? []) {
    // songs 由来の MV（id が "song-" 始まり）は MUSIC として別途追加済みのため除外。
    if (m.id.startsWith("song-")) continue
    push(m.publishDate, {
      category: "movie",
      title: m.title,
      description: m.description,
      href: m.url ?? `${TIMELINE_BASE}/movie`,
    })
  }

  const catOrder: Record<TimelineCategory, number> = {
    anniversary: 0,
    live: 1,
    event: 2,
    goods: 3,
    music: 4,
    movie: 5,
    project: 6,
    stream: 7,
    magazine: 8,
    media: 9,
  }
  out.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return catOrder[a.category] - catOrder[b.category]
  })
  return out
}
