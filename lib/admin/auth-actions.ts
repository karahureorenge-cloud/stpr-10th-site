"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  computeSessionToken,
  isValidToken,
  verifyPassword,
} from "@/lib/auth"

// 保護対象の管理画面ベースパス。10周年用 / 非公式ファンサイト用の 2 系統。
// オープンリダイレクト防止のホワイトリストにも使う。
const ADMIN_BASES = ["/admin", "/stpr-10th-anniversary/admin"] as const

/** from がいずれかの admin ベース配下なら true。 */
function isSafeAdminPath(p: string): boolean {
  return ADMIN_BASES.some((base) => p === base || p.startsWith(`${base}/`))
}

/**
 * ログイン。パスワードを照合し、合致すればセッション Cookie を発行する。
 * 失敗時は loginPath?error=1 に戻す（どちらの admin から来たかを維持）。
 */
export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const fromRaw = String(formData.get("from") ?? "/admin")
  const loginPathRaw = String(formData.get("loginPath") ?? "/admin/login")

  // オープンリダイレクト防止: admin 配下のみ許可。
  const from = isSafeAdminPath(fromRaw) ? fromRaw : "/admin"
  const loginPath = isSafeAdminPath(loginPathRaw) ? loginPathRaw : "/admin/login"

  if (!verifyPassword(password)) {
    redirect(`${loginPath}?error=1&from=${encodeURIComponent(from)}`)
  }

  const token = await computeSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  })

  redirect(from)
}

/** ログアウト。Cookie を破棄して、来た系統のログイン画面へ。bind(null, basePath) で使う。 */
export async function logoutAction(basePath: string) {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  const base = isSafeAdminPath(basePath) ? basePath : "/admin"
  redirect(`${base}/login`)
}

/**
 * server action 内で管理者であることを検証する（多重防御）。
 * proxy で admin ページは守られているが、action 直接呼び出しにも備える。
 */
export async function assertAdmin(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!(await isValidToken(token))) {
    throw new Error("認証が必要です。再度ログインしてください。")
  }
}
