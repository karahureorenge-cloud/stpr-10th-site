/**
 * 年代別 / 種別別セクションの小見出し。
 * 既存ファンサイトの「縦バー + ラベル」見出しと同構造。
 * 縦バーをゴールド→ローズのグラデーションにして 10周年テーマに合わせている。
 */
export default function GroupHeading({ label }: { label: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2.5 font-serif text-lg font-bold text-gold-700">
      <span
        aria-hidden
        className="inline-block h-5 w-1 shrink-0 rounded-sm"
        style={{ background: "linear-gradient(180deg, #D4A853 0%, #F472B6 100%)" }}
      />
      <span style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.03em" }}>
        {label}
      </span>
    </h2>
  )
}
