// 動画（MOVIE）一覧データ。カードクリックで外部URLへ遷移する。

export type Movie = {
  id: string
  title: string
  url?: string
  publishDate?: string
  thumbnail?: string
  description?: string
  category?: string
}
