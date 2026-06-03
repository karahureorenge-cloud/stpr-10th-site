// イベント情報（microCMS スキーマ準拠 / 0003_full_schema.sql 対応）。

/** 店舗情報（コラボカフェ / キッチンカー / ポップアップ 等） */
export type EventStore = {
  storeName?: string
  storeType?: string
  prefecture?: string
  address?: string
  periodText?: string
  mapImage?: string
  reservationUrl?: string
  info?: string
}

/** メニュー・特典商品 */
export type EventMenu = {
  menuName?: string
  image?: string
  description?: string
  info?: string
}

/** グッズ販売 */
export type EventGoods = {
  goodsName?: string
  image?: string
  salePeriod?: string
  purchaseUrl?: string
  info?: string
}

/** 配信情報 */
export type EventBroadcast = {
  broadcastTitle?: string
  broadcastDate?: string
  platform?: string
  streamUrl?: string
  image?: string
  info?: string
}

/** 投稿スケジュール */
export type EventPost = {
  postDate?: string
  postTheme?: string
  postUrl?: string
  thumbnail?: string
  info?: string
}

/** 応募キャンペーン */
export type EventCampaign = {
  campaignName?: string
  entryMethod?: string
  entryPeriod?: string
  prize?: string
  announceDate?: string
  entryUrl?: string
  info?: string
}

/** メディア出演（単発・短期） */
export type EventMedia = {
  mediaName?: string
  programName?: string
  mediaType?: string
  airDate?: string
  url?: string
  info?: string
}

/** 冠番組の各回エピソード */
export type EventEpisode = {
  episodeNumber?: number
  episodeTitle?: string
  airDate?: string
  guests?: string
  summary?: string
  thumbnail?: string
  archiveUrl?: string
  info?: string
}

/** 大会・コンテスト情報 */
export type EventTournament = {
  sectionTitle?: string
  image?: string
  content?: string
}

/** 自由テキストセクション */
export type EventCustom = {
  sectionTitle?: string
  content?: string
  image?: string
}

export type Event = {
  slug: string
  title: string
  eventType: string
  isOngoing?: boolean
  periodStart?: string // 自由文字列
  periodEnd?: string
  keyVisual?: string
  url?: string // 公式サイトURL
  hashtag?: string
  parentEvent?: string // 親イベント（slug）
  description?: string
  memberIds?: string[]
  relatedLives?: string[]
  relatedAlbums?: string[]
  relatedSongs?: string[]
  // 繰り返しセクション
  storeInfo?: EventStore[]
  menuInfo?: EventMenu[]
  goodsInfo?: EventGoods[]
  broadcastInfo?: EventBroadcast[]
  postSchedule?: EventPost[]
  campaignInfo?: EventCampaign[]
  mediaInfo?: EventMedia[]
  episodes?: EventEpisode[]
  tournamentInfo?: EventTournament[]
  customSection?: EventCustom[]
  isActive?: boolean
}

export const EVENTS: Event[] = [
  // ← 帰宅後に実データを入れる
]
