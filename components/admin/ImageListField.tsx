"use client"

import { useState } from "react"
import ImageField from "./ImageField"

/**
 * 複数画像フィールド。
 * 「＋ 画像を追加」で ImageField 行を追加、各行にプレビュー＋削除。
 * 内部状態を URL 配列にし、hidden input（name=field名）へ JSON で書き出す。
 * 保存処理側は "imagelist" として JSON.parse → text[] に格納する。
 */
export default function ImageListField({
  name,
  table,
  initialValue,
}: {
  name: string
  table: string
  initialValue?: unknown
}) {
  const [urls, setUrls] = useState<string[]>(
    Array.isArray(initialValue)
      ? (initialValue as unknown[]).filter((v): v is string => typeof v === "string")
      : [],
  )

  const add = () => setUrls([...urls, ""])
  const update = (i: number, v: string) =>
    setUrls(urls.map((u, idx) => (idx === i ? v : u)))
  const remove = (i: number) => setUrls(urls.filter((_, idx) => idx !== i))

  // 空URLは保存対象から除外。
  const cleaned = urls.map((u) => u.trim()).filter((u) => u.length > 0)

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
          e.preventDefault()
        }
      }}
    >
      <div className="flex flex-col gap-3">
        {urls.map((u, i) => (
          <div key={i} className="rounded-xl border border-gold-200 bg-gold-50/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-[11px] tracking-wider text-gold-500">
                画像 #{i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-full border border-rose-300 px-3 py-0.5 text-[11px] text-rose-500 transition-colors hover:bg-rose-50"
              >
                削除
              </button>
            </div>
            <ImageField
              table={table}
              compact
              value={u}
              onChange={(v) => update(i, v)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="w-fit rounded-full border border-gold-300 bg-white px-4 py-1.5 text-xs text-gold-700 transition-colors hover:bg-gold-50"
        >
          ＋ 画像を追加
        </button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(cleaned)} />
    </div>
  )
}
