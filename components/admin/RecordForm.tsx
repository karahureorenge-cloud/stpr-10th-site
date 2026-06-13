"use client"

import Link from "next/link"
import { useActionState, useEffect, useRef } from "react"
import { getTableConfig, type Field } from "@/lib/admin/tables"
import type { FormState } from "@/lib/admin/crud-actions"
import ChipMultiSelect from "./ChipMultiSelect"
import ImageField from "./ImageField"
import ImageListField from "./ImageListField"
import RepeaterField from "./RepeaterField"
import RichTextEditor from "./RichTextEditor"
import LivePreview from "./LivePreview"
import RecordPreview from "./RecordPreview"

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
  /** new/duplicate のとき slug を自動採番する（edit は既存値を維持）。 */
  mode?: "new" | "edit" | "duplicate"
}

/** スラッグ自動採番：YYYYMMDD-HHmm-NNN（NNN は重複回避用のランダム3桁）。 */
function generateSlug(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  const date = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
  const time = `${p(d.getHours())}${p(d.getMinutes())}`
  const seq = String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  return `${date}-${time}-${seq}`
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
  mode,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {})
  const slugRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLInputElement>(null)
  // 投稿方法ボタン（下書き/予約/即時公開）を出すテーブルか。
  const postMethods = getTableConfig(table)?.postMethods === true

  // 新規作成（複製含む）で slug が空なら自動採番する。SSR は空のまま描画し、
  // マウント後にクライアントで埋めることでハイドレーション不整合を避ける。
  useEffect(() => {
    if (mode === "edit") return
    const el = slugRef.current
    if (el && !el.value) el.value = generateSlug()
  }, [mode])

  return (
    <form
      ref={formRef}
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
      {fields
        .filter((field) => !(postMethods && field.name === "status"))
        .map((field) => {
        const value = initial ? initial[field.name] : undefined
        const inputValue = toInputValue(field, value)
        // boolean は基本 false 初期。ただし is_active（公開フラグ・DB既定 true）は
        // 新規作成時に既定でオンにする（未公開のまま登録される事故を防ぐ）。
        const checked =
          field.type === "boolean"
            ? value != null
              ? Boolean(value)
              : mode !== "edit" && field.name === "is_active"
            : undefined

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
                bulkPaste={field.bulkPaste}
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
              <ChipMultiSelect
                name={field.name}
                options={field.options ?? []}
                optionLabels={field.optionLabels}
                initial={Array.isArray(value) ? value.map(String) : []}
              />
            )}

            {field.type === "boolean" && (
              <span className="flex items-center gap-3">
                {/* トグルスイッチ（sr-only の checkbox を peer で連動）。 */}
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={checked}
                  className="peer sr-only"
                />
                <span className="relative h-6 w-11 shrink-0 rounded-full bg-[#d8d3c4] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:bg-gold-400 peer-checked:after:translate-x-5" />
                <span className="text-xs text-[#9a8aa0]">有効にする</span>
              </span>
            )}

            {(field.type === "text" ||
              field.type === "csv" ||
              field.type === "number" ||
              field.type === "date") && (
              <input
                ref={field.name === "slug" ? slugRef : undefined}
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

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {table === "lives" ? (
          <>
            <LivePreview
              formRef={formRef}
              initial={initial}
              submitLabel={submitLabel}
              pending={pending}
            />
            <Link
              href={cancelHref}
              className="rounded-full border border-gold-200 px-6 py-2.5 text-sm text-[#6a5570] transition-colors hover:bg-gold-50"
            >
              キャンセル
            </Link>
          </>
        ) : postMethods ? (
          <>
            <span className="w-full text-xs font-medium tracking-wider text-gold-700">投稿方法</span>
            <input
              type="hidden"
              name="status"
              ref={statusRef}
              defaultValue={(initial?.status as string) ?? "published"}
            />
            <button
              type="submit"
              disabled={pending}
              onClick={() => { if (statusRef.current) statusRef.current.value = "draft" }}
              className="rounded-full border border-gold-200 bg-white px-6 py-2.5 text-sm text-[#6a5570] transition-colors hover:bg-gold-50 disabled:opacity-50"
            >
              下書き保存
            </button>
            <button
              type="submit"
              disabled={pending}
              onClick={() => { if (statusRef.current) statusRef.current.value = "scheduled" }}
              className="rounded-full border border-gold-300 bg-gold-50 px-6 py-2.5 text-sm font-medium text-gold-700 transition-colors hover:bg-gold-100 disabled:opacity-50"
            >
              予約投稿
            </button>
            <button
              type="submit"
              disabled={pending}
              onClick={() => { if (statusRef.current) statusRef.current.value = "published" }}
              className="rounded-full bg-gold-400 px-8 py-2.5 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
            >
              {pending ? "保存中…" : "即時公開"}
            </button>
            <RecordPreview formRef={formRef} fields={fields} submitLabel={submitLabel} pending={pending} viewOnly />
            <Link
              href={cancelHref}
              className="ml-auto rounded-full border border-gold-200 px-6 py-2.5 text-sm text-[#6a5570] transition-colors hover:bg-gold-50"
            >
              キャンセル
            </Link>
          </>
        ) : (
          <RecordPreview
            formRef={formRef}
            fields={fields}
            submitLabel={submitLabel}
            pending={pending}
            cancelHref={cancelHref}
          />
        )}
      </div>
    </form>
  )
}
