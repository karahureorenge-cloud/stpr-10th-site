import Link from "next/link"
import { logoutAction } from "@/lib/admin/auth-actions"

type Props = {
  basePath: string // /admin or /stpr-10th-anniversary/admin
  /** ロゴ右の小見出し（系統の識別用）。 */
  label?: string
}

/** 管理画面のヘッダー（認証済みページで使用）。配色はスコープのトークンで切替（ゴールド/ブルー）。 */
export default function AdminHeader({ basePath, label }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-gold-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href={basePath} className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-[0.2em] text-gold-600">
            ADMIN
          </span>
          {label && (
            <span className="text-[11px] tracking-wider text-[#9a8aa0]">{label}</span>
          )}
        </Link>
        <form action={logoutAction.bind(null, basePath)}>
          <button
            type="submit"
            className="rounded-full border border-gold-300 bg-white px-4 py-1.5 text-xs tracking-wider text-gold-700 transition-colors hover:bg-gold-50"
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  )
}
