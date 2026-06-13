"use client"

import { useState } from "react"
import Link from "next/link"
import { GROUPS } from "@/data/groups"
import { NEWS_CATEGORIES } from "@/data/newsPosts"
import { generateNewsDraft, saveNewsDraft, type NewsDraft } from "@/lib/admin/news-ai"

const inputCls =
  "rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-100"

export default function NewsGenerator({ basePath }: { basePath: string }) {
  const [source, setSource] = useState("")
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  // 生成結果（編集可能なドラフト）
  const [draft, setDraft] = useState<NewsDraft | null>(null)

  async function onGenerate() {
    setError(null)
    setSavedId(null)
    setGenerating(true)
    const res = await generateNewsDraft(source)
    if (res.error) setError(res.error)
    else if (res.draft) setDraft(res.draft)
    setGenerating(false)
  }

  async function onSave() {
    if (!draft) return
    setError(null)
    setSaving(true)
    const res = await saveNewsDraft({
      title: draft.title,
      body: draft.body,
      tweet: draft.tweet,
      category: draft.category,
      group_slug: draft.group_slug,
    })
    if (res.error) setError(res.error)
    else if (res.id) setSavedId(res.id)
    setSaving(false)
  }

  const set = <K extends keyof NewsDraft>(k: K, v: NewsDraft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d))

  return (
    <div className="flex flex-col gap-6">
      {/* 1. 元ネタ入力 */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium tracking-wider text-gold-700">
          元ネタテキスト（Xのポスト・プレスリリースなどのPR文を貼り付け）
        </label>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={8}
          placeholder="ここに元ネタを貼り付けてください…"
          className={inputCls}
        />
        <div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating || source.trim().length < 10}
            className="rounded-full bg-gold-400 px-8 py-2.5 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
          >
            {generating ? "記事生成中…" : "記事生成"}
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

      {/* 2. プレビュー＆編集 */}
      {draft && (
        <div className="flex flex-col gap-5 rounded-2xl border border-gold-200 bg-gold-50/30 p-5">
          <p className="font-display text-sm tracking-[0.2em] text-gold-700">プレビュー（保存前に編集できます）</p>

          {draft.multiple_topics && (
            <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700">
              ⚠ 元ネタに複数トピックが含まれている可能性があります（1記事1情報の原則）。別記事への分割を検討してください。
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-xs font-medium tracking-wider text-gold-700">タイトル</span>
              <input className={inputCls} value={draft.title} onChange={(e) => set("title", e.target.value)} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wider text-gold-700">カテゴリ</span>
              <select className={inputCls} value={draft.category} onChange={(e) => set("category", e.target.value as NewsDraft["category"])}>
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium tracking-wider text-gold-700">グループ</span>
              <select className={inputCls} value={draft.group_slug} onChange={(e) => set("group_slug", e.target.value as NewsDraft["group_slug"])}>
                {GROUPS.map((g) => (
                  <option key={g.slug} value={g.slug}>{g.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wider text-gold-700">本文（HTML）</span>
            <textarea className={`${inputCls} font-mono text-xs`} rows={12} value={draft.body} onChange={(e) => set("body", e.target.value)} />
          </label>

          {/* 本文レンダリングプレビュー */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wider text-gold-700">本文プレビュー</span>
            <div
              className="prose prose-sm max-w-none rounded-xl border border-gold-200 bg-white p-4 text-[#3a2540]"
              dangerouslySetInnerHTML={{ __html: draft.body }}
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wider text-gold-700">📣 ツイート文</span>
            <textarea className={inputCls} rows={4} value={draft.tweet} onChange={(e) => set("tweet", e.target.value)} />
            <span className="text-[11px] text-[#9a8aa0]">文字数: {draft.tweet.length}（URL・タグ込み140字以内が目安）</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-full bg-gold-400 px-8 py-2.5 font-display text-sm tracking-[0.15em] text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
            >
              {saving ? "保存中…" : "下書き保存（status=draft）"}
            </button>
            <button
              type="button"
              onClick={onGenerate}
              disabled={generating}
              className="rounded-full border border-gold-300 px-6 py-2.5 text-sm text-gold-700 transition-colors hover:bg-gold-50 disabled:opacity-50"
            >
              {generating ? "再生成中…" : "再生成"}
            </button>
          </div>

          {savedId && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              下書き保存しました（公開フラグ: 下書き）。
              <Link href={`${basePath}/news/${savedId}/edit`} className="ml-2 font-bold underline">
                編集画面で開く
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
