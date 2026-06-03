// サイト共通のメタ設定（SEO / OGP / sitemap / robots で使用）。
// 本番では NEXT_PUBLIC_SITE_URL に公開URL（https://...）を設定する。

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "")

export const SITE_NAME = "すとぷり 10th Anniversary"

export const SITE_DESCRIPTION =
  "すとぷり 10周年を記念した特設サイト。ライブ・グッズ・イベント・ミュージックなどの情報をお届けします。"

/** 特設サイトのベースパス */
export const BASE_PATH = "/stpr-10th-anniversary"

/** 絶対URLを組み立てる（path は先頭スラッシュ込み or 空文字） */
export function absoluteUrl(path = ""): string {
  return `${SITE_URL}${path}`
}
