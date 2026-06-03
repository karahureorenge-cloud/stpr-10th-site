// 公開サイト用のデータ取得層。
// Supabase（publishable/anon キー・RLS で SELECT のみ）から読み取り、
// DB の snake_case を data/*.ts のドメイン型（camelCase）へ変換する。
//
// メンバー（MEMBERS）は固定データのため data/members.ts を継続使用する。

import { createBrowserClient } from "@/lib/supabase/client"
import type { Live, Venue } from "@/data/lives"
import type { Goods } from "@/data/goods"
import type { Event } from "@/data/events"
import type { Song, SongType } from "@/data/songs"
import type { Album } from "@/data/albums"
import type { Magazine } from "@/data/magazines"
import type { Media, MediaType } from "@/data/media"
import type { LiveStatus } from "@/data/lives"

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

// === マッピング（DB row → ドメイン型） ===

function toLive(r: Record<string, unknown>): Live {
  return {
    slug: String(r.slug),
    title: String(r.title),
    dateLabel: String(r.date_label ?? ""),
    startDate: u(r.start_date as string | null),
    endDate: u(r.end_date as string | null),
    venues: (Array.isArray(r.venues) ? r.venues : []) as Venue[],
    status: (r.status as LiveStatus) ?? "coming",
    keyVisual: u(r.key_visual as string | null),
    ticketUrl: u(r.ticket_url as string | null),
    description: u(r.description as string | null),
    note: u(r.note as string | null),
    is10th: u(r.is_10th as boolean | null),
  }
}

function toGoods(r: Record<string, unknown>): Goods {
  return {
    slug: String(r.slug),
    title: String(r.title),
    category: String(r.category ?? ""),
    releaseDate: u(r.release_date as string | null),
    price: u(r.price as string | null),
    image: u(r.image as string | null),
    shopUrl: u(r.shop_url as string | null),
    description: u(r.description as string | null),
    memberIds: (Array.isArray(r.member_ids) ? r.member_ids : []) as string[],
  }
}

function toEvent(r: Record<string, unknown>): Event {
  return {
    slug: String(r.slug),
    title: String(r.title),
    eventType: String(r.event_type ?? ""),
    dateLabel: String(r.date_label ?? ""),
    startDate: u(r.start_date as string | null),
    endDate: u(r.end_date as string | null),
    location: u(r.location as string | null),
    url: u(r.url as string | null),
    image: u(r.image as string | null),
    description: u(r.description as string | null),
  }
}

function toSong(r: Record<string, unknown>): Song {
  return {
    slug: String(r.slug),
    title: String(r.title),
    type: (r.type as SongType) ?? "original",
    releaseDate: u(r.release_date as string | null),
    youtubeId: u(r.youtube_id as string | null),
    albumSlug: u(r.album_slug as string | null),
    memberIds: (Array.isArray(r.member_ids) ? r.member_ids : []) as string[],
    description: u(r.description as string | null),
  }
}

function toAlbum(r: Record<string, unknown>): Album {
  return {
    slug: String(r.slug),
    title: String(r.title),
    releaseDate: u(r.release_date as string | null),
    cover: u(r.cover as string | null),
    trackSlugs: (Array.isArray(r.track_slugs) ? r.track_slugs : []) as string[],
    description: u(r.description as string | null),
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
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as Row[]).map(toLive)
}

export async function getLiveBySlug(slug: string): Promise<Live | undefined> {
  const { data, error } = await read()
    .from("lives")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  if (error || !data) return undefined
  return toLive(data as Row)
}

// === グッズ ===
export async function getGoods(): Promise<Goods[]> {
  const { data, error } = await read()
    .from("goods")
    .select("*")
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
    .maybeSingle()
  if (error || !data) return undefined
  return toGoods(data as Row)
}

// === イベント ===
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await read()
    .from("events")
    .select("*")
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
    .maybeSingle()
  if (error || !data) return undefined
  return toEvent(data as Row)
}

// === 楽曲 ===
export async function getSongs(): Promise<Song[]> {
  const { data, error } = await read()
    .from("songs")
    .select("*")
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
    .maybeSingle()
  if (error || !data) return undefined
  return toSong(data as Row)
}

// === アルバム ===
export async function getAlbums(): Promise<Album[]> {
  const { data, error } = await read()
    .from("albums")
    .select("*")
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
    .maybeSingle()
  if (error || !data) return undefined
  return toAlbum(data as Row)
}

// === 雑誌 ===
export async function getMagazines(): Promise<Magazine[]> {
  const { data, error } = await read()
    .from("magazines")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(toMagazine)
}

// === メディア ===
export async function getMedia(): Promise<Media[]> {
  const { data, error } = await read()
    .from("media")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(toMedia)
}

// === 派生ヘルパー ===

/** ライブを新しい順で取得（getLives と同義。意図を明示する別名）。 */
export async function getLivesSortedByDateDesc(): Promise<Live[]> {
  return getLives()
}
