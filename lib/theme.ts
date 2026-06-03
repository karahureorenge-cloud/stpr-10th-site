/**
 * 10周年テーマのカラートークン（JS/インラインスタイルから参照する用）。
 *
 * 値は app/globals.css の @theme で定義したゴールド/ピンク階調と一致させている。
 * Tailwind ユーティリティ（bg-gold-400 等）を使えない場面（SVG fill や
 * インラインスタイル）でこの T を参照する。
 */
export const T = {
  pearl: "#fff8fb", // --color-pearl / 地のベース
  ivory: "#fdf4f0", // --color-ivory
  gold: "#d4a853", // --color-gold-400（基準ゴールド）
  goldL: "#f5e6b8", // --color-gold-200（明るいゴールド）
  goldD: "#a07830", // --color-gold-600（深いゴールド）
  text: "#3a2540", // 本文（深い紫紺）
  muted: "#6a5570", // 弱いテキスト
} as const

/**
 * メンバーカラー6色（アーチの花など、点アクセント用）。
 * 値は @theme の --color-rinu 〜 --color-nanamori と一致。
 */
export const MEMBER_COLORS = [
  "#c0392b", // りぬ
  "#d4a017", // るぅと
  "#2980b9", // ころん
  "#e91e8c", // さとみ
  "#e07b20", // ジェル
  "#7b52ab", // ななもり
] as const
