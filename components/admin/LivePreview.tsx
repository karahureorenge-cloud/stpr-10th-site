"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { buildLivePreview, type LivePreviewState } from "@/lib/admin/crud-actions"
import { LiveDetailBody } from "@/components/live/LiveDetailBody"

// 公開ページのセクション → そのセクションに影響する DB 列。
// どれかが変わっていたら、そのセクションを色枠で強調する。
const SECTION_FIELDS: Record<string, string[]> = {
  hero: [
    "title",
    "subtitle",
    "tour_name",
    "live_type",
    "key_visual_url",
    "key_visual",
    "period_start",
    "period_end",
    "hashtag",
    "group_slug",
    "group_slugs",
    "official_site_url",
    "is_family",
  ],
  members: ["member_slugs", "members"],
  venue: ["venues", "venues_json"],
  ticket: ["ticket_lineup", "ticket_info", "upgrade_goods_info"],
  goods: ["goods_images", "goods_info", "common_venue_limited_goods", "common_venue_limited_items"],
  video: ["live_videos"],
  fc: ["fc_info", "live_viewing", "ppv_info"],
  report: [
    "has_report",
    "report_lead_title",
    "report_content",
    "report_thumbnail",
    "report_gallery",
    "official_report_url",
  ],
}

/** キー順を固定した JSON 文字列。空（null/undefined/[]/""）は共通トークンに正規化。 */
function norm(v: unknown): string {
  if (v == null) return "∅"
  if (Array.isArray(v) && v.length === 0) return "∅"
  if (v === "") return "∅"
  return JSON.stringify(v, (_k, val) =>
    val && typeof val === "object" && !Array.isArray(val)
      ? Object.keys(val as Record<string, unknown>)
          .sort()
          .reduce<Record<string, unknown>>((o, k) => {
            o[k] = (val as Record<string, unknown>)[k]
            return o
          }, {})
      : val,
  )
}

function diffSections(
  record: Record<string, unknown>,
  initial?: Record<string, unknown>,
): string[] {
  if (!initial) return [] // 新規作成は比較対象が無いので強調なし
  const changed: string[] = []
  for (const [section, fields] of Object.entries(SECTION_FIELDS)) {
    if (fields.some((f) => norm(record[f]) !== norm(initial[f]))) changed.push(section)
  }
  return changed
}

type Mode = "view" | "confirm"

/**
 * lives 編集フォーム用のプレビュー。
 * - 「プレビュー」ボタン：現在の入力内容で公開ページの詳細を表示（変更箇所を色枠で強調）。
 * - 主ボタン（公開/更新）：プレビューで確認 → 「この内容で更新」で実際に保存。
 */
export default function LivePreview({
  formRef,
  initial,
  submitLabel = "更新する",
  pending,
  viewOnly = false,
}: {
  formRef: React.RefObject<HTMLFormElement | null>
  initial?: Record<string, unknown>
  submitLabel?: string
  pending: boolean
  /** true で送信ボタンを出さず「プレビュー」のみ（送信は外側の公開ボタンが担う）。 */
  viewOnly?: boolean
}) {
  const [open, setOpen] = useState<Mode | null>(null)
  const [state, setState] = useState<LivePreviewState>({})
  const [changed, setChanged] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const run = async (mode: Mode) => {
    const form = formRef.current
    if (!form) return
    setLoading(true)
    setOpen(mode)
    const res = await buildLivePreview({}, new FormData(form))
    setState(res)
    setChanged(res.record ? diffSections(res.record, initial) : [])
    setLoading(false)
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
          onClick={() => run("confirm")}
          disabled={pending || loading}
          className="rounded-full bg-gold-400 px-8 py-2.5 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
        >
          {pending ? "保存中…" : submitLabel}
        </button>
      )}
      <button
        type="button"
        onClick={() => run("view")}
        disabled={pending || loading}
        className="rounded-full border border-gold-300 px-6 py-2.5 text-sm text-gold-700 transition-colors hover:bg-gold-50 disabled:opacity-50"
      >
        プレビュー
      </button>

      {open !== null &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex flex-col bg-black/50">
            {/* ヘッダー */}
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-3">
              <span className="text-sm font-bold text-gray-800">
                プレビュー{open === "confirm" ? "（この内容で更新できます）" : ""}
              </span>
              {changed.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                  <span className="mr-1 inline-block rounded-sm px-1.5 outline outline-2 outline-amber-500">
                    枠
                  </span>
                  ＝変更あり（{changed.length}箇所）
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {open === "confirm" && (
                  <button
                    type="button"
                    onClick={doSubmit}
                    disabled={!state.live || loading}
                    className="rounded-full bg-accent-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
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

            {/* 本体（公開ページの詳細を再現） */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {loading ? (
                <p className="p-10 text-center text-sm text-gray-500">プレビューを生成中…</p>
              ) : state.error ? (
                <p className="m-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {state.error}
                </p>
              ) : state.live ? (
                <div className="mx-auto max-w-[1600px] px-4 py-8 text-gray-900 lg:px-8">
                  <LiveDetailBody live={state.live} highlightSections={changed} />
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

/** 通常（lives 以外）の送信ボタン＋キャンセル。 */
export function DefaultSubmit({
  submitLabel,
  pending,
  cancelHref,
}: {
  submitLabel: string
  pending: boolean
  cancelHref: string
}) {
  return (
    <>
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
    </>
  )
}
