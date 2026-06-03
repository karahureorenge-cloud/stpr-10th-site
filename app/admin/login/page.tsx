import { loginAction } from "../auth-actions"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const { error, from } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gold-50 via-rose-50 to-lavender/30 px-6">
      <div className="w-full max-w-sm rounded-3xl border border-gold-200 bg-white/80 p-8 shadow-[0_12px_40px_rgba(212,168,83,0.18)] backdrop-blur-sm">
        <h1 className="gold-shimmer text-center font-display text-2xl font-bold tracking-[0.2em]">
          ADMIN
        </h1>
        <p className="mt-2 text-center text-xs text-[#9a8aa0]">
          すとぷり 10周年 管理画面
        </p>

        <form action={loginAction} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="from" value={from ?? "/admin"} />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs tracking-wider text-gold-700">パスワード</span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="rounded-xl border border-gold-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
            />
          </label>

          {error && (
            <p className="text-xs text-rose-500">パスワードが正しくありません。</p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-full bg-gold-400 px-6 py-2.5 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}
