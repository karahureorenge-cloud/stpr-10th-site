import type { LiveStatus } from "@/data/lives"

type Props = {
  status: LiveStatus
  /** sm: 一覧の横並びリスト用 / md: グリッドカード用（既定） */
  size?: "sm" | "md"
}

// 既存ファンサイトと同じ配色・ラベル。
const CONFIG: Record<LiveStatus, { label: string; className: string }> = {
  coming: { label: "COMING SOON", className: "bg-slate-500" },
  ongoing: { label: "LIVE NOW", className: "bg-green-500 animate-pulse" },
  finished: { label: "FINISHED", className: "bg-gray-500/80" },
}

/** ライブ等の状態バッジ */
export default function StatusBadge({ status, size = "md" }: Props) {
  const { label, className } = CONFIG[status]
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[10px]"
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-[0.12em] text-white ${sizeCls} ${className}`}
    >
      {label}
    </span>
  )
}
