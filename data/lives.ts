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

/** 公演ごとのセットリスト（会場・日付・部ごとにセトリが変わる場合） */
export type ShowSetlist = {
  showRef?: string // 対象公演（venues の各 shows を「会場 日付 部」で参照）
  note?: string // 変更点メモ（例: 時間押しでM10カット / アンコールで〇〇追加）。セトリ未入力なら基本セトリ＋このメモを表示
  setlist?: SetlistItem[] // この公演のセトリ（大きく変わる場合のみ。未入力なら基本セトリを使用）
}

/** 会場公演 */
export type Venue = {
  venueName: string
  stageName?: string
  prefecture?: string
  areaMapImage?: string
  shows?: Show[]
  venueGoods?: VenueGoods[] // この会場のグッズ販売方法
  venueLimitedGoods?: string // この会場限定グッズ（リッチテキストHTML）
  venueLimitedItems?: string // この会場限定配布物（リッチテキストHTML）
  setlistNotes?: string // この会場でのセトリ変更メモ
}

/** チケット種別ごとの 会場・日付別 受付期間 */
export type TicketVenueDate = {
  venueName?: string // 会場名（venues に登録された会場名から選択）
  ticketLineupRefs?: string[] // 対象チケット（ticketName を参照・複数可）
  showRefs?: string[] // 対象公演（venues の各 shows を「会場 日付 部」で参照・複数可）
  date?: string // チケットの対象日付（公演日ではない）
  salePeriod?: string // 受付期間（自由文字列・販売期間と同形式）
}

/** チケットラインナップ（名称・価格の早見） */
export type TicketLineup = {
  ticketName?: string
  price?: string
}

/** チケット販売場所と購入URL（STPRチケット / チケットぴあ 等） */
export type TicketSalesOutlet = {
  name?: string // 販売場所（例: STPRチケット / チケットぴあ）
  url?: string // 購入URL
}

/** チケット種別（複数対応） */
export type TicketInfo = {
  ticketType: string
  ticketLineupRefs?: string[] // 対応するチケットラインナップ（ticketName を参照・複数可）
  showRefs?: string[] // 対象公演（venues の各 shows を「会場 日付 部」で参照・複数可）
  salePeriod?: string
  saleStart?: string // 受付開始日時（ステータス自動判定用）
  saleEnd?: string // 受付終了日時（ステータス自動判定用）
  price?: string
  method?: string // "抽選" / "先着" 等
  info?: string
  salesOutlets?: TicketSalesOutlet[] // チケット販売場所・購入URL（複数）
  venueDates?: TicketVenueDate[] // 会場・日付ごとの受付期間
}

/** 会場ごとのグッズ販売方法（1会場に複数の売り方を登録可） */
export type VenueGoods = {
  saleType?: string // 例: 事前整理券あり / 整理券なし（当日）
  seirikenPeriod?: string // 整理券 申込期間（整理券ありのとき）
  lotteryResultDate?: string // 当選発表日（整理券ありのとき）
  lotteryUrl?: string // 抽選URL（整理券ありのとき）
  saleLocation?: string // 販売場所
  saleTime?: string // 販売時間
  note?: string // 補足
}

/** ツアー全体のグッズ受付方法（事前通販 / 会場受取 / 事後通販） */
export type GoodsReceiveMethod = {
  method?: string // 事前通販 / 会場受取 / 事後通販
  salePeriod?: string // 受付期間
  purchaseUrl?: string // 申込 / 購入URL
  deliveryInfo?: string // 配送 / 受取情報
  purchaseBonus?: string // 購入特典
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
  goodsImages?: string[] // ① ツアー全体のグッズ写真（公開URL[]）
  goodsReceiveMethods?: GoodsReceiveMethod[] // ② 受付方法（事前通販/会場受取/事後通販）
  commonVenueLimitedGoods?: string // ツアー共通の会場限定グッズ（リッチテキストHTML）
  commonVenueLimitedItems?: string // ツアー共通の会場限定配布物（リッチテキストHTML）
  setlist?: SetlistItem[] // 基本セットリスト
  showSetlists?: ShowSetlist[] // 公演ごとのセットリスト
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
