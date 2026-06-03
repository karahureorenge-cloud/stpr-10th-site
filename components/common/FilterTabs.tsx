"use client"

type Props = {
  /** 選択肢（先頭に "ALL" 等を含めて渡す） */
  options: string[]
  /** 現在の選択値 */
  value: string
  onChange: (value: string) => void
  /** ラベル変換（例: type の小文字 → 表示用大文字）。省略時はそのまま表示 */
  renderLabel?: (option: string) => string
}

/**
 * カテゴリ / 種別フィルタのピル行。
 * 既存ファンサイトの category フィルタと同構造。配色をゴールドに合わせている。
 */
export default function FilterTabs({ options, value, onChange, renderLabel }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-4 py-1.5 text-sm tracking-wider transition-colors ${
              active
                ? "border-gold-400 bg-gold-400 text-white"
                : "border-gold-200 bg-white/60 text-[#6a5570] hover:border-gold-300 hover:text-gold-600"
            }`}
          >
            {renderLabel ? renderLabel(opt) : opt}
          </button>
        )
      })}
    </div>
  )
}
