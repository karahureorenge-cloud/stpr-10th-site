"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import type { Field } from "@/lib/admin/tables"

type PreviewVal =
  | { kind: "text"; text: string }
  | { kind: "html"; html: string }
  | { kind: "images"; urls: string[] }
  | { kind: "list"; items: string[] }
  | { kind: "bool"; on: boolean }
  | { kind: "json"; text: string }

function parseJsonArray(s: string): string[] {
  try {
    const a = JSON.parse(s)
    return Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

/** フォームの現在値を、プレビュー表示用の値に変換する。 */
function readFieldValue(field: Field, fd: FormData): PreviewVal {
  const name = field.name
  switch (field.type) {
    case "boolean":
      return { kind: "bool", on: fd.get(name) != null && fd.get(name) !== "" }
    case "richtext":
      return { kind: "html", html: String(fd.get(name) ?? "") }
    case "image":
      return field.multiple
        ? { kind: "images", urls: parseJsonArray(String(fd.get(name) ?? "")) }
        : { kind: "images", urls: [String(fd.get(name) ?? "")].filter(Boolean) }
    case "imagelist":
      return { kind: "images", urls: parseJsonArray(String(fd.get(name) ?? "")) }
    case "multiselect": {
      const vals = fd.getAll(name).map(String)
      return { kind: "list", items: vals.map((v) => field.optionLabels?.[v] ?? v) }
    }
    case "csv":
      return {
        kind: "list",
        items: String(fd.get(name) ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      }
    case "repeater": {
      const arr = parseJsonArray(String(fd.get(name) ?? ""))
      // repeater は JSON 配列。件数だけ示す（中身は冗長なため）。
      try {
        const parsed = JSON.parse(String(fd.get(name) ?? "[]"))
        const n = Array.isArray(parsed) ? parsed.length : 0
        return { kind: "text", text: n > 0 ? `（${n}件）` : "" }
      } catch {
        return { kind: "text", text: arr.length ? `（${arr.length}件）` : "" }
      }
    }
    case "json":
      return { kind: "json", text: String(fd.get(name) ?? "") }
    case "select": {
      const v = String(fd.get(name) ?? "")
      return { kind: "text", text: field.optionLabels?.[v] ?? v }
    }
    default:
      return { kind: "text", text: String(fd.get(name) ?? "") }
  }
}

type Mode = "view" | "confirm"

/**
 * 汎用レコードプレビュー（lives 以外の全テーブル用）。
 * - 主ボタン：プレビューで確認 → 「この内容で{submitLabel}」で実保存（requestSubmit）。
 * - 「プレビュー」ボタン：内容確認のみ（view）。
 * - viewOnly: 主ボタンを出さず「プレビュー」のみ（投稿方法ボタンが別にある news 等）。
 */
export default function RecordPreview({
  formRef,
  fields,
  submitLabel,
  pending,
  cancelHref,
  viewOnly,
}: {
  formRef: React.RefObject<HTMLFormElement | null>
  fields: Field[]
  submitLabel: string
  pending: boolean
  cancelHref?: string
  viewOnly?: boolean
}) {
  const [open, setOpen] = useState<Mode | null>(null)
  const [rows, setRows] = useState<{ label: string; val: PreviewVal }[]>([])

  const build = (mode: Mode) => {
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    setRows(fields.map((f) => ({ label: f.label, val: readFieldValue(f, fd) })))
    setOpen(mode)
  }
  const close = () => setOpen(null)
  const doSubmit = () => {
    close()
    formRef.current?.requestSubmit()
  }

  return (
    <>
      {!viewOnly && (
        <button
          type="button"
          onClick={() => build("confirm")}
          disabled={pending}
          className="rounded-full bg-gold-400 px-8 py-2.5 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
        >
          {pending ? "保存中…" : submitLabel}
        </button>
      )}
      <button
        type="button"
        onClick={() => build("view")}
        disabled={pending}
        className="rounded-full border border-gold-300 px-6 py-2.5 text-sm text-gold-700 transition-colors hover:bg-gold-50 disabled:opacity-50"
      >
        プレビュー
      </button>
      {!viewOnly && cancelHref && (
        <Link
          href={cancelHref}
          className="rounded-full border border-gold-200 px-6 py-2.5 text-sm text-[#6a5570] transition-colors hover:bg-gold-50"
        >
          キャンセル
        </Link>
      )}

      {open !== null &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex flex-col bg-black/50">
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-3">
              <span className="text-sm font-bold text-gray-800">
                プレビュー{open === "confirm" ? "（この内容で保存できます）" : ""}
              </span>
              <div className="ml-auto flex items-center gap-2">
                {open === "confirm" && (
                  <button
                    type="button"
                    onClick={doSubmit}
                    className="rounded-full bg-accent-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-accent-700"
                  >
                    この内容で{submitLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                >
                  閉じる
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="mx-auto flex max-w-2xl flex-col gap-4">
                {rows.map(({ label, val }, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
                    <PreviewValue val={val} />
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

function PreviewValue({ val }: { val: PreviewVal }) {
  switch (val.kind) {
    case "bool":
      return <p className="text-sm text-gray-800">{val.on ? "ON（有効）" : "OFF"}</p>
    case "html":
      return val.html.trim() && val.html.trim() !== "<p></p>" ? (
        <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: val.html }} />
      ) : (
        <p className="text-sm text-gray-400">—</p>
      )
    case "images":
      return val.urls.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {val.urls.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={u} alt="" className="h-20 w-auto rounded-lg border border-gray-200 object-contain" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">—</p>
      )
    case "list":
      return val.items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {val.items.map((it, i) => (
            <span key={i} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{it}</span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">—</p>
      )
    case "json":
      return val.text.trim() ? (
        <pre className="overflow-x-auto rounded-lg bg-gray-50 p-2 text-[11px] text-gray-700">{val.text}</pre>
      ) : (
        <p className="text-sm text-gray-400">—</p>
      )
    default:
      return <p className="whitespace-pre-wrap text-sm text-gray-800">{val.text.trim() || "—"}</p>
  }
}
