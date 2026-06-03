import type { MetadataRoute } from "next"
import { SITE_URL, BASE_PATH } from "@/lib/site"
import { getLives, getGoods, getEvents, getSongs, getAlbums } from "@/lib/repo"

// Supabase から slug を取得するため動的生成。
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `${SITE_URL}${BASE_PATH}`
  const lastModified = new Date()

  // 固定ページ。
  const staticPaths = [
    "",
    "/live",
    "/goods",
    "/event",
    "/music",
    "/album",
    "/magazine",
    "/media",
  ]
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified,
    changeFrequency: "weekly",
  }))

  // 詳細ページ（slug ベース）。取得失敗時は固定ページのみ返す。
  let dynamicEntries: MetadataRoute.Sitemap = []
  try {
    const [lives, goods, events, songs, albums] = await Promise.all([
      getLives(),
      getGoods(),
      getEvents(),
      getSongs(),
      getAlbums(),
    ])
    dynamicEntries = [
      ...lives.map((l) => ({ url: `${base}/live/${l.slug}`, lastModified })),
      ...goods.map((g) => ({ url: `${base}/goods/${g.slug}`, lastModified })),
      ...events.map((e) => ({ url: `${base}/event/${e.slug}`, lastModified })),
      ...songs.map((s) => ({ url: `${base}/music/${s.slug}`, lastModified })),
      ...albums.map((a) => ({ url: `${base}/album/${a.slug}`, lastModified })),
    ]
  } catch {
    dynamicEntries = []
  }

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    ...staticEntries,
    ...dynamicEntries,
  ]
}
