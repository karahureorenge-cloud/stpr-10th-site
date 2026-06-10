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
  venueGoods?: VenueGoods[] // この会場のグッズ販売情報
  setlistNotes?: string // この会場でのセトリ変更メモ
}

/** チケット種別ごとの 会場・日付別 受付期間 */
export type TicketVenueDate = {
  venueName?: string // 会場名（venues に登録された会場名から選択）
  ticketLineupRefs?: string[] // 対象チケット（ticketName を参照・複数可）
  date?: string // チケットの対象日付（公演日ではない）
  salePeriod?: string // 受付期間（自由文字列・販売期間と同形式）
}

/** チケットラインナップ（名称・価格の早見） */
export type TicketLineup = {
  ticketName?: string
  price?: string
}

/** チケット種別（複数対応） */
export type TicketInfo = {
  ticketType: string
  ticketLineupRefs?: string[] // 対応するチケットラインナップ（ticketName を参照・複数可）
  salePeriod?: string
  price?: string
  method?: string // "抽選" / "先着" 等
  info?: string
  purchaseUrl?: string
  status?: string // "受付中" / "受付終了" 等
  venueDates?: TicketVenueDate[] // 会場・日付ごとの受付期間
}

/** 会場ごとのグッズ販売状況 */
export type VenueGoods = {
  saleTime?: string // 販売時間
  saleLocation?: string // 販売場所
  ticketPeriod?: string // 整理券の受付期間
  lotteryResult?: string // 抽選結果発表
  ticketRequiredTime?: string // 整理券が必要な時間
}

/** ライブ物販情報 */
export type LiveGoodsInfo = {
  saleType?: string
  image?: string | string[]
  salePeriod?: string
  deliveryInfo?: string
  venueProducts?: string // 会場販売商品（テキスト/リッチテキスト）
  purchaseBonus?: string // 購入特典
  paymentMethod?: string // お支払い方法
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
  /** 所属グループ識別子（data/groups.ts の GroupSlug）。公開 /live の絞り込みに使う。 */
  groupSlug?: string
  /** 複数所属グループ（0012・microCMS 取込の受け皿 group_slugs）。 */
  groupSlugs?: string[]
  subtitle?: string
  tourName?: string
  /** 代表ライブ種別（live_type[] の先頭。表示用の後方互換）。 */
  liveType?: string
  /** ライブ種別（複数。0012 で live_type を text[] 化）。 */
  liveTypes?: string[]
  status: LiveStatus
  periodStart?: string // ISO datetime
  periodEnd?: string
  keyVisual?: string
  /** メンバー slugs（新・取込用 member_slugs）。 */
  memberSlugs?: string[]
  /** microCMS 元ID（移行照合用）。 */
  microcmsId?: string
  /** 公開フラグ。false で公開一覧から除外（default true）。 */
  isActive?: boolean
  /** STPR Family / すとふぇす 等の合同ライブ。 */
  isFamily?: boolean
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
