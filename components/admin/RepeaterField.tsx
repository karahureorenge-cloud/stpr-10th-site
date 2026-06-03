"use client"

import { useState } from "react"
import type { SubField } from "@/lib/admin/tables"
import ImageField from "./ImageField"

type Row = Record<string, unknown>

/** 1 行分の空オブジェクトを作る。 */
function emptyRow(itemFields: SubField[]): Row {
  const row: Row = {}
  for (const f of itemFields) {
    row[f.name] = f.type === "repeater" ? [] : ""
  }
  return row
}

/** 行が完全に空（全項目が空文字 / 空配列 / undefined）かどうか。 */
function isEmptyRow(row: Row): boolean {
  return Object.values(row).every((v) => {
    if (v == null || v === "") return true
    if (Array.isArray(v)) return v.length === 0
    return false
  })
}

const inputCls =
  "rounded-lg border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"

/** サブ項目 1 つの入力 UI。 */
function SubFieldInput({
  field,
  value,
  onChange,
  table,
}: {
  field: SubField
  value: unknown
  onChange: (v: unknown) => void
  table: string
}) {
  if (field.type === "image") {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-gold-700">{field.label}</span>
        <ImageField
          table={table}
          compact
          value={typeof value === "string" ? value : ""}
          onChange={(url) => onChange(url)}
        />
      </label>
    )
  }

  if (field.type === "repeater") {
    return (
      <div className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-[11px] font-medium text-gold-700">{field.label}</span>
        <div className="rounded-lg border border-dashed border-gold-200 p-2">
          <RowsEditor
            rows={Array.isArray(value) ? (value as Row[]) : []}
            onChange={(rows) => onChange(rows)}
            itemFields={field.itemFields ?? []}
            table={table}
          />
        </div>
      </div>
    )
  }

  if (field.type === "textarea") {
    return (
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-[11px] font-medium text-gold-700">{field.label}</span>
        <textarea
          rows={2}
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      </label>
    )
  }

  if (field.type === "select") {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-gold-700">{field.label}</span>
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          <option value="">（未選択）</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    )
  }

  // text / number
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-gold-700">{field.label}</span>
      <input
        type={field.type === "number" ? "number" : "text"}
        value={value == null ? "" : String(value)}
        placeholder={field.placeholder}
        onChange={(e) => {
          if (field.type === "number") {
            const n = e.target.value
            onChange(n === "" ? "" : Number(n))
          } else {
            onChange(e.target.value)
          }
        }}
        className={inputCls}
      />
    </label>
  )
}

/** 行の集合を編集する制御コンポーネント（ネストでも再利用）。 */
function RowsEditor({
  rows,
  onChange,
  itemFields,
  table,
}: {
  rows: Row[]
  onChange: (rows: Row[]) => void
  itemFields: SubField[]
  table: string
}) {
  const update = (i: number, name: string, val: unknown) => {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [name]: val } : r)))
  }
  const addRow = () => onChange([...rows, emptyRow(itemFields)])
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i))

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-xl border border-gold-200 bg-gold-50/30 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-[11px] tracking-wider text-gold-500">
              #{i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="rounded-full border border-rose-300 px-3 py-0.5 text-[11px] text-rose-500 transition-colors hover:bg-rose-50"
            >
              削除
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {itemFields.map((f) => (
              <SubFieldInput
                key={f.name}
                field={f}
                value={row[f.name]}
                onChange={(v) => update(i, f.name, v)}
                table={table}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="w-fit rounded-full border border-gold-300 bg-white px-4 py-1.5 text-xs text-gold-700 transition-colors hover:bg-gold-50"
      >
        ＋ 追加
      </button>
    </div>
  )
}

/**
 * JSON配列フィールドの専用エディタ。
 * 行追加・削除し、内部状態を JSON 文字列にして hidden input（name=field名）へ書き出す。
 * 保存処理側は従来の json/repeater パースでそのまま受け取れる。
 */
export default function RepeaterField({
  name,
  table,
  itemFields,
  initialValue,
}: {
  name: string
  table: string
  itemFields: SubField[]
  initialValue?: unknown
}) {
  const [rows, setRows] = useState<Row[]>(
    Array.isArray(initialValue) ? (initialValue as Row[]) : [],
  )

  // 完全に空の行は保存対象から除外。
  const cleaned = rows.filter((r) => !isEmptyRow(r))

  return (
    <>
      <RowsEditor
        rows={rows}
        onChange={setRows}
        itemFields={itemFields}
        table={table}
      />
      <input type="hidden" name={name} value={JSON.stringify(cleaned)} />
    </>
  )
}
