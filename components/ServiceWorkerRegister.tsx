"use client"

import { useEffect } from "react"

/**
 * Service Worker（/sw.js）を登録するクライアントコンポーネント。
 * ルートレイアウトに 1 つ置くだけで PWA のオフライン対応が有効になる。
 * 本番（HTTPS）でのみ意味があるが、localhost でも登録は可能。
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // 登録失敗時は黙ってスキップ（サイトの表示には影響しない）。
      })
    }
    // 初期描画をブロックしないよう load 後に登録。
    if (document.readyState === "complete") {
      register()
    } else {
      window.addEventListener("load", register, { once: true })
    }
  }, [])

  return null
}
