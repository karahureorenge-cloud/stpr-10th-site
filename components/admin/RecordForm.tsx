"use client"

import Link from "next/link"
import { useActionState } from "react"
import type { Field } from "@/lib/admin/tables"
import type { FormState } from "@/lib/admin/crud-actions"
import ImageField from "./ImageField"
import ImageListField from "./ImageListField"
import RepeaterField from "./RepeaterField"
import RichTextEditor from "./RichTextEditor"

// 複数コントロールを内包し、<label> で包むと余白クリックが内部の最初の
// ボタン（行削除等）を発火させてしまう型。これらは <div> でラップする。
const BLOCK_TYPES = new Set(["repeater", "image", "imagelist", "richtext", "multiselect"])

type Props = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  fields: Field[]
  table: string
  initial?: Record<string, unknown>
  submitLabel: string
  cancelHref: string
}

/** DB 値をフォーム入力用の文字列/真偽に変換する。 */
function toInputValue(field: Field, value: unknown): string {
  if (value == null) return ""
  switch (field.type) {
    case "date":
      // "2026-06-04T..." → "2026-06-04"
      return String(value).slice(0, 10)
    case "csv":
      return Array.isArray(value) ? value.join(", ") : String(value)
    case "json":
      try {
        return JSON.stringify(value, null, 2)
      } catch {
        return ""
      }
    case "number":
      return String(value)
    default:
      return String(value)
  }
}

export default function RecordForm({
  action,
  fields,
  table,
  initial,
  submitLabel,
  cancelHref,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5"
      onKeyDown={(e) => {
        // テキスト入力で Enter を押しても submit させない（誤送信防止）。
        // textarea は改行を許可するため対象外。
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
          e.preventDefault()
        }
      }}
    >
      {fields.map((field) => {
        const value = initial ? initial[field.name] : undefined
        const inputValue = toInputValue(field, value)
        const checked =
          field.type === "boolean" ? Boolean(value) : undefined

        // ブロック型は label ではなく div でラップ（誤クリック対策）。
        const Wrapper = BLOCK_TYPES.has(field.type) ? "div" : "label"

        return (
          <Wrapper key={field.name} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wider text-gold-700">
              {field.label}
              {field.required && <span className="ml-1 text-rose-500">*</span>}
            </span>

            {field.type === "textarea" && (
              <textarea
                name={field.name}
                defaultValue={inputValue}
                placeholder={field.placeholder}
                rows={3}
                className="rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
              />
            )}

            {field.type === "json" && (
              <textarea
                name={field.name}
                defaultValue={inputValue}
                placeholder={field.placeholder}
                rows={5}
                spellCheck={false}
                className="rounded-xl border border-gold-200 bg-white px-3 py-2 font-mono text-xs outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
              />
            )}

            {field.type === "image" && (
              <ImageField
                name={field.name}
                table={table}
                multiple={field.multiple}
                initialValue={
                  field.multiple
                    ? Array.isArray(value)
                      ? (value as string[])
                      : value == null
                        ? []
                        : [String(value)]
                    : value == null
                      ? ""
                      : String(value)
                }
              />
            )}

            {field.type === "imagelist" && (
              <ImageListField name={field.name} table={table} initialValue={value} />
            )}

            {field.type === "richtext" && (
              <RichTextEditor
                name={field.name}
                table={table}
                initialValue={value == null ? "" : String(value)}
              />
            )}

            {field.type === "repeater" && (
              <RepeaterField
                name={field.name}
                table={table}
                itemFields={field.itemFields ?? []}
                initialValue={value}
              />
            )}

            {field.type === "select" && (
              <select
                name={field.name}
                defaultValue={inputValue || field.options?.[0] || ""}
                className="rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {field.optionLabels?.[opt] ?? opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "multiselect" && (
              <>
                <select
                  name={field.name}
                  multiple
                  defaultValue={Array.isArray(value) ? value.map(String) : []}
                  size={Math.min(field.options?.length ?? 4, 8)}
                  className="rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {field.optionLabels?.[opt] ?? opt}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#9a8aa0]">
                  Ctrl（Mac は ⌘）+クリックで複数選択
                </span>
              </>
            )}

            {field.type === "boolean" && (
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={checked}
                  className="h-4 w-4 accent-gold-400"
                />
                <span className="text-xs text-[#9a8aa0]">有効にする</span>
              </span>
            )}

            {(field.type === "text" ||
              field.type === "csv" ||
              field.type === "number" ||
              field.type === "date") && (
              <input
                type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                name={field.name}
                defaultValue={inputValue}
                placeholder={field.placeholder}
                className="rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
              />
            )}

            {field.help && (
              <span className="text-[11px] text-[#9a8aa0]">{field.help}</span>
            )}
          </Wrapper>
        )
      })}

      {state.error && (
        <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gold-400 px-8 py-2.5 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
        >
          {pending ? "保存中…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-full border border-gold-200 px-6 py-2.5 text-sm text-[#6a5570] transition-colors hover:bg-gold-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  )
}
