type Props = {
  label: string
  /** ゴールド（既定・カテゴリ/種別）/ ローズ（楽曲タイプ等）/ 白地（補助） */
  tone?: "gold" | "rose" | "light"
  size?: "sm" | "md"
}

/**
 * カード左上などに置くタイプ / カテゴリのピルバッジ。
 * 既存ファンサイトのタイプバッジ（accent 色のピル）と同構造を、ゴールド/ローズで再現。
 */
export default function TypeBadge({ label, tone = "gold", size = "md" }: Props) {
  if (!label) return null
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
  const toneCls =
    tone === "rose"
      ? "bg-rose-400/90 text-white"
      : tone === "light"
        ? "bg-white/90 text-gold-700"
        : "bg-gold-400/95 text-white"
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold tracking-wider ${sizeCls} ${toneCls}`}
    >
      {label}
    </span>
  )
}
