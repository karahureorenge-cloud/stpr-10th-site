import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_COOKIE, isValidToken } from "@/lib/auth"

/**
 * 管理画面（2系統）を保護する。未認証なら来た系統のログイン画面へリダイレクト。
 *   /admin/*                        … 非公式ファンサイト 管理画面
 *   /stpr-10th-anniversary/admin/*  … すとぷり10th 管理画面
 * 各 *​/login 自身は除外する。
 * （Next.js 16 で middleware → proxy に名称変更された規約に対応）
 */
const ADMIN_BASES = ["/stpr-10th-anniversary/admin", "/admin"] as const

/** pathname が属する admin ベースパスを返す（長い方を優先して判定）。 */
function adminBaseOf(pathname: string): string | null {
  for (const base of ADMIN_BASES) {
    if (pathname === base || pathname.startsWith(`${base}/`)) return base
  }
  return null
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const base = adminBaseOf(pathname)
  if (!base) return NextResponse.next()

  const loginPath = `${base}/login`
  if (pathname === loginPath || pathname.startsWith(`${loginPath}/`)) {
    return NextResponse.next()
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (await isValidToken(token)) {
    return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  url.pathname = loginPath
  url.searchParams.set("from", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/stpr-10th-anniversary/admin",
    "/stpr-10th-anniversary/admin/:path*",
  ],
}
