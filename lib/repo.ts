// 公開サイト用のデータ取得層。
// Supabase（publishable/anon キー・RLS で SELECT のみ）から読み取り、
// DB の snake_case を data/*.ts のドメイン型（camelCase）へ変換する。
//
// メンバー（MEMBERS）は固定データのため data/members.ts を継続使用する。

import { createBrowserClient } from "@/lib/supabase/client"
import { getLiveStatus, resolveYoutubeThumbnail } from "@/lib/utils"
import type {
  Live,
  Venue,
  TicketInfo,
  TicketLineup,
  GoodsReceiveMethod,
  SetlistItem,
  ShowSetlist,
  PpvInfo,
  LiveViewing,
  LiveVideo,
} from "@/data/lives"
import type { Goods } from "@/data/goods"
import { GROUPS, type GroupSlug } from "@/data/groups"
import type { NewsPost, NewsCategory } from "@/data/newsPosts"
import type { ScheduleEvent, ScheduleType } from "@/data/scheduleEvents"
import type {
  Event,
  EventStore,
  EventMenu,
  EventGoods,
  EventBroadcast,
  EventPost,
  EventCampaign,
  EventMedia,
  EventEpisode,
  EventTournament,
  EventCustom,
} from "@/data/events"
import type { Song, SongType } from "@/data/songs"
import type { Album, AlbumEdition, AlbumBonus, AlbumTrack } from "@/data/albums"
import type { Magazine } from "@/data/magazines"
import type { Media, MediaType } from "@/data/media"
import type { Visual } from "@/data/visuals"
import type { Project } from "@/data/projects"
import type { Movie } from "@/data/movies"
import type { Stream } from "@/data/streams"

// 読み取り用クライアント（モジュール内で 1 度だけ生成）。
let _client: ReturnType<typeof createBrowserClient> | null = null
function read() {
  if (!_client) _client = createBrowserClient()
  return _client
}

// undefined 正規化（DB の null → undefined）。
function u<T>(v: T | null | undefined): T | undefined {
  return v == null ? undefined : v
}

// text[] / jsonb 配列を安全に配列へ。
function strArr(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : []
}
function jsonArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

// === マッピング（DB row → ドメイン型） ===

export function toLive(r: Record<string, unknown>): Live {
  return {
    slug: String(r.slug),
    title: String(r.title),
    groupSlugs: strArr(r.group_slugs),
    // group_slug（旧・単一）優先。無ければ group_slugs の先頭。
    groupSlug: u(r.group_slug as string | null) ?? strArr(r.group_slugs)[0],
    subtitle: u(r.subtitle as string | null),
    tourName: u(r.tour_name as string | null),
    // live_type は 0012 で text[] 化。配列なら先頭を代表値に、文字列なら従来通り。
    liveType: Array.isArray(r.live_type)
      ? (r.live_type as string[])[0]
      : u(r.live_type as string | null),
    liveTypes: Array.isArray(r.live_type)
      ? (r.live_type as string[])
      : r.live_type
        ? [String(r.live_type)]
        : [],
    // ステータスは保存値を使わず period_start / period_end から都度計算する。
    status: getLiveStatus(
      u(r.period_start as string | null),
      u(r.period_end as string | null),
    ),
    periodStart: u(r.period_start as string | null),
    periodEnd: u(r.period_end as string | null),
    // 新・key_visual_url 優先。無ければ旧 key_visual。
    keyVisual: u(r.key_visual_url as string | null) ?? u(r.key_visual as string | null),
    isActive: u(r.is_active as boolean | null),
    isFamily: u(r.is_family as boolean | null),
    members: strArr(r.members),
    memberSlugs: strArr(r.member_slugs),
    microcmsId: u(r.microcms_id as string | null),
    hashtag: u(r.hashtag as string | null),
    description: u(r.description as string | null),
    note: u(r.note as string | null),
    // 管理画面で編集する venues を優先。空なら取込用 venues_json をフォールバック。
    venues: jsonArr<Venue>(r.venues).length
      ? jsonArr<Venue>(r.venues)
      : jsonArr<Venue>(r.venues_json),
    ticketLineup: jsonArr<TicketLineup>(r.ticket_lineup),
    ticketInfo: jsonArr<TicketInfo>(r.ticket_info),
    goodsImages: strArr(r.goods_images),
    goodsReceiveMethods: jsonArr<GoodsReceiveMethod>(r.goods_info),
    commonVenueLimitedGoods: u(r.common_venue_limited_goods as string | null),
    commonVenueLimitedItems: u(r.common_venue_limited_items as string | null),
    setlist: jsonArr<SetlistItem>(r.setlist),
    showSetlists: jsonArr<ShowSetlist>(r.show_setlists),
    ppvInfo: jsonArr<PpvInfo>(r.ppv_info),
    liveViewing: jsonArr<LiveViewing>(r.live_viewing),
    liveVideos: jsonArr<LiveVideo>(r.live_videos),
    fcInfo: strArr(r.fc_info),
    upgradeGoodsInfo: strArr(r.upgrade_goods_info),
    officialSiteUrl: u(r.official_site_url as string | null),
    officialPlaylistUrl: u(r.official_playlist_url as string | null),
    officialReportUrl: u(r.official_report_url as string | null),
    unofficialReportUrl: u(r.unofficial_report_url as string | null),
    relatedLives: strArr(r.related_lives),
    relatedAlbums: strArr(r.related_albums),
    relatedEvents: strArr(r.related_events),
    hasReport: u(r.has_report as boolean | null),
    reportPublishedAt: u(r.report_published_at as string | null),
    reportLeadTitle: u(r.report_lead_title as string | null),
    reportContent: u(r.report_content as string | null),
    reportThumbnail: u(r.report_thumbnail as string | null),
    reportGallery: u(r.report_gallery as string | null),
    is10th: u(r.is_10th as boolean | null),
  }
}

function toGoods(r: Record<string, unknown>): Goods {
  return {
    slug: String(r.slug),
    title: String(r.title),
    productType: String(r.product_type ?? ""),
    saleType: u(r.sale_type as string | null),
    releaseDate: u(r.release_date as string | null),
    salePeriod: u(r.sale_period as string | null),
    price: u(r.price as string | null),
    keyVisual: u(r.key_visual as string | null),
    lineupImages: strArr(r.lineup_images),
    purchaseUrl: u(r.purchase_url as string | null),
    deliveryInfo: u(r.delivery_info as string | null),
    relatedLive: u(r.related_live as string | null),
    description: u(r.description as string | null),
    memberIds: strArr(r.member_ids),
    isActive: u(r.is_active as boolean | null),
  }
}

function toEvent(r: Record<string, unknown>): Event {
  return {
    slug: String(r.slug),
    title: String(r.title),
    eventType: String(r.event_type ?? ""),
    collabPartner: u(r.collab_partner as string | null),
    isOngoing: u(r.is_ongoing as boolean | null),
    periodStart: u(r.period_start as string | null),
    periodEnd: u(r.period_end as string | null),
    keyVisual: u(r.key_visual as string | null),
    url: u(r.url as string | null),
    hashtag: u(r.hashtag as string | null),
    parentEvent: u(r.parent_event as string | null),
    description: u(r.description as string | null),
    memberIds: strArr(r.member_ids),
    relatedLives: strArr(r.related_lives),
    relatedAlbums: strArr(r.related_albums),
    relatedSongs: strArr(r.related_songs),
    storeInfo: jsonArr<EventStore>(r.store_info),
    menuInfo: jsonArr<EventMenu>(r.menu_info),
    goodsInfo: jsonArr<EventGoods>(r.goods_info),
    broadcastInfo: jsonArr<EventBroadcast>(r.broadcast_info),
    postSchedule: jsonArr<EventPost>(r.post_schedule),
    campaignInfo: jsonArr<EventCampaign>(r.campaign_info),
    mediaInfo: jsonArr<EventMedia>(r.media_info),
    episodes: jsonArr<EventEpisode>(r.episodes),
    tournamentInfo: jsonArr<EventTournament>(r.tournament_info),
    customSection: jsonArr<EventCustom>(r.custom_section),
    isActive: u(r.is_active as boolean | null),
  }
}

function toSong(r: Record<string, unknown>): Song {
  return {
    slug: String(r.slug),
    title: String(r.title),
    artist: u(r.artist as string | null),
    type: (r.type as SongType) ?? "ORIGINAL",
    publishedDate: u(r.published_date as string | null),
    duration: u(r.duration as string | null),
    genre: u(r.genre as string | null),
    youtubeId: u(r.youtube_id as string | null),
    youtubeUrl: u(r.youtube_url as string | null),
    streamingUrl: u(r.streaming_url as string | null),
    albumSlug: u(r.album_slug as string | null),
    lyrics: u(r.lyrics as string | null),
    credit: u(r.credit as string | null),
    memberIds: strArr(r.member_ids),
    description: u(r.description as string | null),
    isActive: u(r.is_active as boolean | null),
  }
}

function toAlbum(r: Record<string, unknown>): Album {
  return {
    slug: String(r.slug),
    title: String(r.title),
    artist: u(r.artist as string | null),
    albumType: u(r.album_type as string | null),
    releaseDate: u(r.release_date as string | null),
    totalDuration: u(r.total_duration as string | null),
    label: u(r.label as string | null),
    cover: u(r.cover as string | null),
    summaryImage: u(r.summary_image as string | null),
    purchaseUrl: u(r.purchase_url as string | null),
    streamingUrl: u(r.streaming_url as string | null),
    xfdUrl: u(r.xfd_url as string | null),
    tracks: jsonArr<AlbumTrack>(r.tracks),
    editions: jsonArr<AlbumEdition>(r.editions),
    bonuses: jsonArr<AlbumBonus>(r.bonuses),
    description: u(r.description as string | null),
    isActive: u(r.is_active as boolean | null),
  }
}

function toMagazine(r: Record<string, unknown>): Magazine {
  return {
    id: String(r.id),
    name: String(r.name),
    issue: String(r.issue ?? ""),
    releaseDate: u(r.release_date as string | null),
    publisher: u(r.publisher as string | null),
    content: u(r.content as string | null),
    image: u(r.image as string | null),
    images: strArr(r.images),
    status: u(r.status as string | null),
    url: u(r.url as string | null),
  }
}

function toMedia(r: Record<string, unknown>): Media {
  return {
    id: String(r.id),
    type: (r.type as MediaType) ?? "tv",
    programName: String(r.program_name),
    station: String(r.station ?? ""),
    dateLabel: String(r.date_label ?? ""),
    content: u(r.content as string | null),
    url: u(r.url as string | null),
  }
}

// 取得失敗時は空配列/undefined にフォールバック（公開サイトは落とさない）。
type Row = Record<string, unknown>

// === ライブ ===
export async function getLives(): Promise<Live[]> {
  const { data, error } = await read()
    .from("lives")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("period_start", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as Row[]).map(toLive)
}

export async function getLiveBySlug(slug: string): Promise<Live | undefined> {
  const { data, error } = await read()
    .from("lives")
    .select("*")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) return undefined
  return toLive(data as Row)
}

// === NEWS ===
const NEWS_CATS = new Set(["live", "goods", "ticket", "media", "other"])
const VALID_GROUP_SLUGS = new Set<string>(GROUPS.map((g) => g.slug))

/** 有効な GroupSlug を取り出す（未知の slug は除外し、無ければ既定）。 */
function pickGroupSlug(candidates: unknown[]): GroupSlug {
  for (const c of candidates) {
    if (typeof c === "string" && VALID_GROUP_SLUGS.has(c)) return c as GroupSlug
  }
  return "Strawberry_Prince"
}

/** richtext(HTML) → プレーンテキスト（ブロック終端を改行に）。 */
function htmlToPlain(html: string): string {
  return html
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section|article|header|footer|ul|ol|pre|figure)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function toNewsPost(r: Row): NewsPost {
  const groups = Array.isArray(r.group_slugs) ? (r.group_slugs as string[]) : []
  const cat = typeof r.category === "string" && NEWS_CATS.has(r.category) ? (r.category as NewsCategory) : "other"
  const plain = htmlToPlain(typeof r.body === "string" ? r.body : "")
  return {
    id: String(r.id),
    title: String(r.title ?? ""),
    category: cat,
    groupSlug: pickGroupSlug(groups),
    publishedAt: String(r.published_at ?? r.created_at ?? ""),
    excerpt: plain.replace(/\n+/g, " ").slice(0, 90),
    body: plain,
    thumbnail: typeof r.thumbnail === "string" && r.thumbnail ? r.thumbnail : undefined,
    isBreaking: r.is_breaking === true,
    isFeatured: r.is_featured === true,
    spoiler: r.spoiler === true,
    author: "STPR運営",
  }
}

/** 公開 NEWS：publish_status=published のみ、公開日時の新しい順。 */
export async function getNews(): Promise<NewsPost[]> {
  const { data, error } = await read()
    .from("news")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as Row[]).map(toNewsPost)
}

/** 公開 NEWS 単体取得（publish_status=published のみ）。 */
export async function getNewsById(id: string): Promise<NewsPost | undefined> {
  const { data, error } = await read()
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) return undefined
  return toNewsPost(data as Row)
}

// === SCHEDULE ===
const SCHED_TYPES = new Set(["live", "event", "goods", "ticket", "stream"])

function toScheduleEvent(r: Row): ScheduleEvent {
  const t = typeof r.type === "string" && SCHED_TYPES.has(r.type) ? (r.type as ScheduleType) : "event"
  return {
    id: String(r.id),
    title: String(r.title ?? ""),
    groupSlug: pickGroupSlug([r.group_slug]),
    type: t,
    start: String(r.start_at ?? ""),
    end: typeof r.end_at === "string" && r.end_at ? r.end_at : undefined,
    venue: typeof r.venue === "string" && r.venue ? r.venue : undefined,
    note: typeof r.note === "string" && r.note ? r.note : undefined,
  }
}

/** 公開 SCHEDULE：開始日時の昇順。 */
export async function getSchedules(): Promise<ScheduleEvent[]> {
  const { data, error } = await read()
    .from("schedules")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("start_at", { ascending: true, nullsFirst: false })
  if (error || !data) return []
  return (data as Row[]).map(toScheduleEvent)
}

/**
 * 公開 /live（非公式ファンサイト）用。10周年（is_10th=true）を除外したライブを
 * 新しい順で返す（公開判定 publish_status は getLives 側で適用済み）。
 * groupSlug を渡すとそのグループだけに絞り込む。
 */
export async function getActiveLives(groupSlug?: string): Promise<Live[]> {
  const lives = (await getLives()).filter((l) => l.is10th !== true)
  return groupSlug ? lives.filter((l) => l.groupSlug === groupSlug) : lives
}

/** 公開 /stpr-10th-anniversary/live 用。is_10th=true のライブを新しい順で返す。 */
export async function getTenthLives(): Promise<Live[]> {
  return (await getLives()).filter((l) => l.is10th === true)
}

/** 指定グループの公開ライブを新しい順で返す。 */
export async function getLivesForGroup(groupSlug: string): Promise<Live[]> {
  return getActiveLives(groupSlug)
}

// === グッズ ===
export async function getGoods(): Promise<Goods[]> {
  const { data, error } = await read()
    .from("goods")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(toGoods)
}

export async function getGoodsBySlug(slug: string): Promise<Goods | undefined> {
  const { data, error } = await read()
    .from("goods")
    .select("*")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) return undefined
  return toGoods(data as Row)
}

// === イベント ===
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await read()
    .from("events")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(toEvent)
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  const { data, error } = await read()
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) return undefined
  return toEvent(data as Row)
}

// === 楽曲 ===
export async function getSongs(): Promise<Song[]> {
  const { data, error } = await read()
    .from("songs")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(toSong)
}

export async function getSongBySlug(slug: string): Promise<Song | undefined> {
  const { data, error } = await read()
    .from("songs")
    .select("*")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) return undefined
  return toSong(data as Row)
}

// === アルバム ===
export async function getAlbums(): Promise<Album[]> {
  const { data, error } = await read()
    .from("albums")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(toAlbum)
}

export async function getAlbumBySlug(slug: string): Promise<Album | undefined> {
  const { data, error } = await read()
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) return undefined
  return toAlbum(data as Row)
}

// === 雑誌 ===
export async function getMagazines(): Promise<Magazine[]> {
  const { data, error } = await read()
    .from("magazines")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(toMagazine)
}

export async function getMagazineById(id: string): Promise<Magazine | undefined> {
  const { data, error } = await read()
    .from("magazines")
    .select("*")
    .eq("id", id)
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) return undefined
  return toMagazine(data as Row)
}

// === ビジュアル ===
function toVisual(r: Record<string, unknown>): Visual {
  return {
    id: String(r.id),
    slug: u(r.slug as string | null),
    title: u(r.title as string | null),
    image: u(r.image as string | null),
    releaseDate: u(r.release_date as string | null),
    member: u(r.member as string | null),
  }
}

export async function getVisuals(): Promise<Visual[]> {
  const { data, error } = await read()
    .from("visuals")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("release_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as Row[]).map(toVisual)
}

// === メディア ===
export async function getMedia(): Promise<Media[]> {
  const { data, error } = await read()
    .from("media")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(toMedia)
}

// === 企画（PROJECT）===
function toProject(r: Record<string, unknown>): Project {
  return {
    slug: String(r.slug),
    title: String(r.title),
    url: u(r.url as string | null),
    publishDate: u(r.publish_date as string | null),
    thumbnail: u(r.thumbnail as string | null),
    description: u(r.description as string | null),
    category: u(r.category as string | null),
    images: strArr(r.images),
    periodStart: u(r.period_start as string | null),
    periodEnd: u(r.period_end as string | null),
  }
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await read()
    .from("projects")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("publish_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as Row[]).map(toProject)
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { data, error } = await read()
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .maybeSingle()
  if (error || !data) return undefined
  return toProject(data as Row)
}

// === 動画（MOVIE）===
function toMovie(r: Record<string, unknown>): Movie {
  return {
    id: String(r.id),
    title: String(r.title),
    url: u(r.url as string | null),
    publishDate: u(r.publish_date as string | null),
    thumbnail: u(r.thumbnail as string | null),
    description: u(r.description as string | null),
    category: u(r.category as string | null),
  }
}

/**
 * songs テーブルの行を MOVIE 形式へ変換する。
 * - title: 曲名 / url: youtubeUrl / publishDate: 発売日（published_date）
 * - thumbnail: youtubeUrl（または youtube_id）から YouTube サムネイルを自動取得
 * - category: 「MV」固定
 * 呼び出し側で youtubeUrl が空の song は除外する。
 */
function songRowToMovie(r: Record<string, unknown>): Movie {
  const youtubeUrl = u(r.youtube_url as string | null)
  const youtubeId = u(r.youtube_id as string | null)
  return {
    id: `song-${String(r.slug)}`,
    title: String(r.title),
    url: youtubeUrl,
    publishDate: u(r.published_date as string | null),
    thumbnail: resolveYoutubeThumbnail(youtubeId, youtubeUrl),
    category: "MV",
  }
}

export async function getMovies(): Promise<Movie[]> {
  // movies テーブルと songs テーブルを並行取得してマージする。
  const [moviesRes, songsRes] = await Promise.all([
    read()
      .from("movies")
      .select("*")
      .eq("publish_status", "published")
      .is("deleted_at", null)
      .order("publish_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    read()
      .from("songs")
      .select("*")
      .eq("publish_status", "published")
      .is("deleted_at", null),
  ])

  const movies = moviesRes.error || !moviesRes.data ? [] : (moviesRes.data as Row[]).map(toMovie)

  // songs は youtubeUrl が空のものを除外して MOVIE 形式へ変換。
  const songMovies =
    songsRes.error || !songsRes.data
      ? []
      : (songsRes.data as Row[])
          .filter((r) => {
            const url = u(r.youtube_url as string | null)
            return typeof url === "string" && url.trim() !== ""
          })
          .map(songRowToMovie)

  // 発売日の新しい順に並べ替え（publishDate 無しは末尾）。
  return [...movies, ...songMovies].sort((a, b) => {
    if (!a.publishDate && !b.publishDate) return 0
    if (!a.publishDate) return 1
    if (!b.publishDate) return -1
    return b.publishDate.localeCompare(a.publishDate)
  })
}

// === 配信（STREAM）===
function toStream(r: Record<string, unknown>): Stream {
  return {
    id: String(r.id),
    title: String(r.title),
    url: u(r.url as string | null),
    publishDate: u(r.publish_date as string | null),
    thumbnail: u(r.thumbnail as string | null),
    description: u(r.description as string | null),
    category: u(r.category as string | null),
  }
}

export async function getStreams(): Promise<Stream[]> {
  const { data, error } = await read()
    .from("streams")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("publish_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as Row[]).map(toStream)
}

// === 全文検索（ilike 横断） ===

const SEARCH_BASE = "/stpr-10th-anniversary"

export type SearchCategory =
  | "live"
  | "goods"
  | "event"
  | "song"
  | "album"
  | "magazine"
  | "media"

export type SearchHit = {
  category: SearchCategory
  title: string
  sub?: string
  href: string
}

export type SearchGroup = {
  category: SearchCategory
  label: string
  hits: SearchHit[]
}

/** ilike パターンを壊す文字（カンマ・括弧・ワイルドカード等）を除去する。 */
function sanitizeSearchTerm(q: string): string {
  return q.replace(/[,()*%\\]/g, " ").replace(/\s+/g, " ").trim()
}

const SEARCH_LABELS: Record<SearchCategory, string> = {
  live: "ライブ",
  goods: "グッズ",
  event: "イベント",
  song: "楽曲",
  album: "アルバム",
  magazine: "雑誌",
  media: "メディア",
}

/**
 * lives / goods / events / songs / albums / magazines / media を ilike で横断検索する。
 * カテゴリ別にグループ化して返す。0 件のグループは除外。
 */
export async function searchAll(query: string): Promise<SearchGroup[]> {
  const term = sanitizeSearchTerm(query)
  if (!term) return []
  const pat = `%${term}%`
  const client = read()

  // 指定列の OR ilike で 1 テーブルを検索する（公開・未削除のみ）。
  const run = async (table: string, cols: string[]): Promise<Row[]> => {
    const or = cols.map((c) => `${c}.ilike.${pat}`).join(",")
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq("publish_status", "published")
      .is("deleted_at", null)
      .or(or)
      .limit(50)
    if (error || !data) return []
    return data as Row[]
  }

  const [lives, goods, events, songs, albums, magazines, media] = await Promise.all([
    run("lives", ["title", "description"]),
    run("goods", ["title", "description"]),
    run("events", ["title", "description"]),
    run("songs", ["title", "artist", "description"]),
    run("albums", ["title", "artist", "description"]),
    run("magazines", ["name", "content"]),
    run("media", ["program_name", "station", "content"]),
  ])

  const groups: SearchGroup[] = [
    {
      category: "live",
      label: SEARCH_LABELS.live,
      // 10周年サイトの検索なので 10周年ライブ（is_10th=true）のみ。
      hits: lives
        .filter((r) => r.is_10th === true)
        .map((r) => ({
          category: "live" as const,
          title: String(r.title ?? ""),
          sub: u(r.live_type as string | null),
          href: `${SEARCH_BASE}/live/${String(r.slug)}`,
        })),
    },
    {
      category: "goods",
      label: SEARCH_LABELS.goods,
      hits: goods.map((r) => ({
        category: "goods" as const,
        title: String(r.title ?? ""),
        sub: u(r.product_type as string | null),
        href: `${SEARCH_BASE}/goods/${String(r.slug)}`,
      })),
    },
    {
      category: "event",
      label: SEARCH_LABELS.event,
      hits: events.map((r) => ({
        category: "event" as const,
        title: String(r.title ?? ""),
        sub: u(r.event_type as string | null),
        href: `${SEARCH_BASE}/event/${String(r.slug)}`,
      })),
    },
    {
      category: "song",
      label: SEARCH_LABELS.song,
      hits: songs.map((r) => ({
        category: "song" as const,
        title: String(r.title ?? ""),
        sub: u(r.artist as string | null),
        href: `${SEARCH_BASE}/music/${String(r.slug)}`,
      })),
    },
    {
      category: "album",
      label: SEARCH_LABELS.album,
      hits: albums.map((r) => ({
        category: "album" as const,
        title: String(r.title ?? ""),
        sub: u(r.artist as string | null),
        href: `${SEARCH_BASE}/album/${String(r.slug)}`,
      })),
    },
    {
      category: "magazine",
      label: SEARCH_LABELS.magazine,
      hits: magazines.map((r) => ({
        category: "magazine" as const,
        title: String(r.name ?? ""),
        sub: u(r.issue as string | null),
        href: `${SEARCH_BASE}/magazine/${String(r.id)}`,
      })),
    },
    {
      category: "media",
      label: SEARCH_LABELS.media,
      hits: media.map((r) => ({
        category: "media" as const,
        title: String(r.program_name ?? ""),
        sub: u(r.station as string | null),
        href: u(r.url as string | null) ?? "#",
      })),
    },
  ]

  return groups.filter((g) => g.hits.length > 0)
}

/** 指定テーブルの行数（head count のみ・データ本体は取得しない）。失敗時は 0。 */
export async function getCount(table: string): Promise<number> {
  const { count, error } = await read()
    .from(table)
    .select("*", { count: "exact", head: true })
  if (error || count == null) return 0
  return count
}

// === 派生ヘルパー ===

/** ライブを新しい順で取得（getLives と同義。意図を明示する別名）。 */
export async function getLivesSortedByDateDesc(): Promise<Live[]> {
  return getLives()
}
