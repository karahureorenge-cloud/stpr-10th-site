import type { NextConfig } from "next"
import { fileURLToPath } from "node:url"

const nextConfig: NextConfig = {
  // 親ディレクトリの余分な lockfile を誤検出しないようルートを固定する。
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
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
}

export default nextConfig
