type Tone = "pink" | "gold" | "blue" | "slate" | "green"

type Props = {
  label: string
  /** 既定 pink。LATEST/NEW=pink、種別=gold、LIMITED=blue 等 */
  tone?: Tone
  size?: "sm" | "md"
  /** シールのように少し傾ける（LATEST/NEW など強調用） */
  rotate?: boolean
  pulse?: boolean
}

const TONES: Record<Tone, string> = {
  pink: "border-rose-300 text-rose-500",
  gold: "border-gold-400 text-gold-700",
  blue: "border-sky-300 text-sky-600",
  slate: "border-slate-300 text-slate-500",
  green: "border-green-400 text-green-600",
}

/**
 * 既存ファンサイトの sp-stamp 相当の「ピンク丸角」バッジ。
 * 白地＋メンバー/テーマカラーのボーダーで、太字・トラッキング・微回転。
 * 10周年テーマのゴールド＋ピンクで配色。
 */
export default function Stamp({
  label,
  tone = "pink",
  size = "md",
  rotate = false,
  pulse = false,
}: Props) {
  if (!label) return null
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 bg-white/90 font-bold uppercase tracking-[0.14em] shadow-sm ${sizeCls} ${TONES[tone]} ${pulse ? "animate-pulse" : ""}`}
      style={rotate ? { transform: "rotate(-4deg)" } : undefined}
    >
      {label}
    </span>
  )
}
