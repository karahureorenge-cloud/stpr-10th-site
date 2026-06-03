// 楽曲情報（microCMS スキーマ準拠 / 0003_full_schema.sql 対応）。

export type SongType = "ORIGINAL" | "Cover"

export type Song = {
  slug: string
  title: string
  artist?: string
  type: SongType
  publishedDate?: string // 自由文字列
  duration?: string
  genre?: string
  youtubeId?: string // v= 以降のID
  youtubeUrl?: string // フルURL
  streamingUrl?: string
  albumSlug?: string
  lyrics?: string
  credit?: string
  memberIds?: string[]
  description?: string
  isActive?: boolean
}

export const SONGS: Song[] = [
  // ← 帰宅後に実データを入れる
]
