import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_COOKIE, isValidToken } from "@/lib/auth"

/**
 * アクセス制御（Next.js 16: middleware → proxy）。
 *   /live, /live/*                         … 公開（誰でも閲覧可）
 *   /admin/*, /stpr-10th-anniversary/admin/* … 各管理画面の Cookie ログインで保護（従来通り）
 *   それ以外のすべてのページ                 … サイト全体 Basic 認証（ADMIN_PASSWORD）で保護
 * 静的アセット（_next/*・favicon・拡張子付きファイル）は matcher で除外。
 */
const ADMIN_BASES = ["/stpr-10th-anniversary/admin", "/admin"] as const

/** pathname が属する admin ベースパスを返す（長い方を優先して判定）。 */
function adminBaseOf(pathname: string): string | null {
  for (const base of ADMIN_BASES) {
    if (pathname === base || pathname.startsWith(`${base}/`)) return base
  }
  return null
}

/** 公開してよいパス（/live と配下のみ）。 */
function isPublic(pathname: string): boolean {
  return pathname === "/live" || pathname.startsWith("/live/")
}

/** サイト全体 Basic 認証の検証（ユーザー名は任意、パスワードのみ照合）。
 *  Edge の env インライン化のため process.env.ADMIN_PASSWORD は本ファイル内で直接参照する。 */
function siteGateOk(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD
  // パスワード未設定の環境では誤ロックを避けるためゲートしない。
  if (!expected) return true
  const header = req.headers.get("authorization") ?? ""
  if (!header.startsWith("Basic ")) return false
  let decoded = ""
  try {
    decoded = atob(header.slice(6))
  } catch {
    return false
  }
  const password = decoded.slice(decoded.indexOf(":") + 1)
  return password === expected
}

function unauthorized(): NextResponse {
  return new NextResponse("このサイトは現在非公開です（認証が必要）。", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="stpr-info (private)", charset="UTF-8"',
      "content-type": "text/plain; charset=utf-8",
    },
  })
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) 公開ページ（/live 系）はそのまま通す。
  if (isPublic(pathname)) return NextResponse.next()

  // 2) 管理画面は従来通り Cookie ログインで保護（未認証はログインへ）。
  const base = adminBaseOf(pathname)
  if (base) {
    const loginPath = `${base}/login`
    if (pathname === loginPath || pathname.startsWith(`${loginPath}/`)) {
      return NextResponse.next()
    }
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    if (await isValidToken(token)) return NextResponse.next()
    const url = req.nextUrl.clone()
    url.pathname = loginPath
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // 3) それ以外のページはサイト全体パスワードで保護。
  if (!siteGateOk(req)) return unauthorized()
  return NextResponse.next()
}

export const config = {
  matcher: [
    // _next/*・favicon・拡張子付きファイル（画像・sw.js・manifest 等）以外すべて。
    "/((?!_next/|favicon\\.ico|.*\\.).*)",
  ],
}
