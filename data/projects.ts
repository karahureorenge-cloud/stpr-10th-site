// 企画（PROJECT）一覧データ。実データは管理画面から投入する。

export type Project = {
  slug: string
  title: string
  url?: string
  publishDate?: string
  thumbnail?: string
  description?: string
  category?: string
  images: string[]
  periodStart?: string
  periodEnd?: string
}
