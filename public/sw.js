/* すとぷり 10th PWA Service Worker
 * - インストール時に最低限のシェル（TOP・ロゴ・manifest）をプリキャッシュ。
 * - ページ遷移（navigate）は network-first：オンライン時は最新を取得しつつ
 *   キャッシュも更新し、オフライン時はキャッシュ済みページ → TOP の順に返す。
 * - 同一オリジンの静的アセット（_next/static 等）は cache-first で高速化。
 * next-pwa は Turbopack 非対応のため、軽量な自前 SW で実装している。
 */

const CACHE_VERSION = "stpr-10th-v1"
const OFFLINE_URL = "/stpr-10th-anniversary"

// インストール時にプリキャッシュするシェル。
const PRECACHE_URLS = [OFFLINE_URL, "/logo-10th.png", "/manifest.json"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined),
  )
  // 新しい SW を即時有効化。
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  // GET 以外・他オリジンは素通し（Supabase など）。
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // admin 配下はキャッシュしない（常に最新・要認証）。
  if (url.pathname.startsWith("/admin")) return

  // ページ遷移: network-first（取得成功時にキャッシュ更新、失敗時はキャッシュ）。
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || (await caches.match(OFFLINE_URL)) || Response.error()
        }),
    )
    return
  }

  // 静的アセット: cache-first（無ければ取得してキャッシュ）。
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone()
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached || Response.error())
    }),
  )
})
