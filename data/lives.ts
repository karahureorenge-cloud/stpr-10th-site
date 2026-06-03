// ライブ情報（microCMS スキーマ準拠 / 0003_full_schema.sql 対応）。

export type LiveStatus = "coming" | "ongoing" | "finished"

/** セットリスト1曲分 */
export type SetlistItem = {
  trackNumber?: number
  title?: string
  memo?: string
}

/** 個別公演 */
export type Show = {
  date?: string
  partLabel?: string // "昼の部" 等
  scheduleText?: string // "開場16:00/開演17:00" 等
  setlist?: SetlistItem[]
}

/** 会場公演 */
export type Venue = {
  venueName: string
  stageName?: string
  prefecture?: string
  areaMapImage?: string
  shows?: Show[]
}

/** チケットラインナップ（名称・価格の早見） */
export type TicketLineup = {
  ticketName?: string
  price?: string
}

/** チケット種別（複数対応） */
export type TicketInfo = {
  ticketType: string
  salePeriod?: string
  price?: string
  method?: string // "抽選" / "先着" 等
  info?: string
  purchaseUrl?: string
  status?: string // "受付中" / "受付終了" 等
}

/** 会場ごとのグッズ販売情報 */
export type VenueGoods = {
  venueName?: string
  saleSchedule?: string // 販売日時
  ticketInfo?: string // 整理券の有無・申込方法
  ticketPeriod?: string // 整理券申込期間
  payment?: string // 決済方法
  note?: string // 備考（福袋情報など）
}

/** ライブ物販情報 */
export type LiveGoodsInfo = {
  saleType?: string
  image?: string
  salePeriod?: string
  deliveryInfo?: string
  info?: string
  purchaseUrl?: string
}

/** 配信（PPV） */
export type PpvInfo = {
  platform?: string
  viewingPeriod?: string
  price?: string
  purchaseUrl?: string
  info?: string
}

/** ライブビューイング */
export type LiveViewing = {
  title?: string
  screeningDate?: string
  price?: string
  theatersUrl?: string
  purchaseUrl?: string
  info?: string
}

export type Live = {
  slug: string
  title: string
  liveType?: string
  status: LiveStatus
  periodStart?: string // ISO datetime
  periodEnd?: string
  keyVisual?: string
  members?: string[] // メンバーID
  hashtag?: string
  description?: string
  note?: string
  venues: Venue[]
  ticketLineup?: TicketLineup[]
  ticketInfo?: TicketInfo[]
  goodsInfo?: LiveGoodsInfo[]
  goodsImages?: string[] // ライブグッズ画像（公開URL[]）
  venueGoods?: VenueGoods[] // 会場ごとのグッズ販売情報
  setlist?: SetlistItem[] // セットリスト
  ppvInfo?: PpvInfo[]
  liveViewing?: LiveViewing[]
  fcInfo?: string[] // 画像URL[]
  upgradeGoodsInfo?: string[] // 画像URL[]
  officialSiteUrl?: string
  officialPlaylistUrl?: string
  officialReportUrl?: string
  unofficialReportUrl?: string
  relatedLives?: string[] // slug[]
  relatedAlbums?: string[]
  relatedEvents?: string[]
  // ライブレポート
  hasReport?: boolean
  reportPublishedAt?: string
  reportLeadTitle?: string
  reportContent?: string
  reportThumbnail?: string
  reportGallery?: string
  is10th?: boolean
}

export const LIVES: Live[] = [
  // ← 帰宅後に実データを入れる
]
