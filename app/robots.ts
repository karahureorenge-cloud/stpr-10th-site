import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 管理画面（2系統）はクロール対象外。
        disallow: [
          "/admin",
          "/admin/",
          "/stpr-10th-anniversary/admin",
          "/stpr-10th-anniversary/admin/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
