// グッズ情報（microCMS スキーマ準拠 / 0003_full_schema.sql 対応）。

export type Goods = {
  slug: string
  title: string
  productType: string // "アクリル" | "缶バッジ" 等
  saleType?: string // "受注生産" / "数量限定" 等
  releaseDate?: string
  salePeriod?: string // 販売期間の自由文字列
  price?: string
  keyVisual?: string
  lineupImages?: string[] // 複数画像URL
  purchaseUrl?: string
  deliveryInfo?: string
  relatedLive?: string // 関連ライブ（slug）
  description?: string
  memberIds?: string[]
  isActive?: boolean
}

export const GOODS: Goods[] = [
  // ← 帰宅後に実データを入れる
]
