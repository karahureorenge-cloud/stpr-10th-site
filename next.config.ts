import type { NextConfig } from "next"
import { fileURLToPath } from "node:url"

const nextConfig: NextConfig = {
  // 親ディレクトリの余分な lockfile を誤検出しないようルートを固定する。
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  // Server Actions の既定ボディ上限は 1MB のため、画像アップロード（最大10MB）が
  // 1MB を超えると送信時点で失敗し「アップロード中にエラーが発生しました」になる。
  // upload-actions の上限（10MB）に合わせて引き上げる。
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      // YouTube サムネイル
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      // Supabase Storage（media バケットの公開URL）
      // 例: https://<project-ref>.supabase.co/storage/v1/object/public/media/...
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // PWA: Service Worker は常に最新を取得させ、ルート全体をスコープに許可する。
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ]
  },
}

export default nextConfig
