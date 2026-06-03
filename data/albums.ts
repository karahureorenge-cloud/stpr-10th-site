// アルバム情報（microCMS スキーマ準拠 / 0003_full_schema.sql 対応）。

/** 形態・盤違い */
export type AlbumEdition = {
  editionName?: string
  catalog?: string
  price?: string
  spec?: string
  cover?: string
}

/** 特典 */
export type AlbumBonus = {
  store?: string
  bonusName?: string
  bonusImage?: string
}

/** 収録曲 */
export type AlbumTrack = {
  trackNumber?: number
  songSlug?: string
}

export type Album = {
  slug: string
  title: string
  artist?: string
  albumType?: string // "アルバム" / "シングル" 等
  releaseDate?: string
  totalDuration?: string
  label?: string
  cover?: string
  summaryImage?: string
  purchaseUrl?: string
  streamingUrl?: string
  xfdUrl?: string
  tracks?: AlbumTrack[]
  editions?: AlbumEdition[]
  bonuses?: AlbumBonus[]
  description?: string
  isActive?: boolean
}

export const ALBUMS: Album[] = [
  // ← 帰宅後に実データを入れる
]
