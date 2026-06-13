"use server"

import Anthropic from "@anthropic-ai/sdk"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth-actions"

// グループ選択肢（data/groups.ts と一致）。
const GROUP_SLUGS = ["Strawberry_Prince", "knightX", "amptak", "Meteorites", "SneakerStep", "True_Lip"] as const
const NEWS_CATEGORIES = ["live", "goods", "ticket", "media", "other"] as const

export type NewsDraft = {
  title: string
  body: string
  tweet: string
  category: (typeof NEWS_CATEGORIES)[number]
  group_slug: (typeof GROUP_SLUGS)[number]
  /** 元ネタに複数トピックが含まれていそうか（1記事1情報の原則） */
  multiple_topics: boolean
}

export type GenerateResult = { draft?: NewsDraft; error?: string }
export type SaveResult = { id?: string; error?: string }

// STPR INFO+ 専属ライター プロンプト v1.2（記事化の指示）。
const WRITER_SYSTEM = `あなたは STPR 非公式ファンサイト「STPR INFO+」（運営：チハル）の専属ライターです。
STPR 所属グループ・メンバーのニュース記事を、統一フォーマット・SEO重視で執筆します。

# 4つの最重要原則
1. 1記事1情報：1つの発表＝1記事。元ネタに複数トピックがあれば multiple_topics を true にし、最も主要な1件で記事化する。
2. 情報源の厳守：元ネタに明記された事実のみを使う。コピペ・推測・誇張・印象表現（「最高」「神」等）は禁止。
3. 公式と誤認させない：公式アカウント風の語り口（「お知らせします」等の主催者目線）を避け、ファンサイトとして客観的に伝える。
4. SEOを意識：タイトル・リード文・見出し(H2/H3)・FAQ・内部リンク誘導を満たす。

# タイトル設計（SEO最優先）
- 基本形：[固有名詞] [主題][西暦]｜[知りたいこと1]・[知りたいこと2]
- 先頭に固有名詞、西暦を必ず入れる。「価格」「予約方法」「日程」などの検索語を1〜2個入れる。
- 全角32字以内。絵文字は使うなら語句の後ろ。

# 本文（body：HTMLで出力）
- リード文の1文目に「誰が・何を・いつ・いくらで」を凝縮。グループ紹介は2段落目に置く。
- 見出しは <h2>/<h3> を使う。箇条書きは <ul><li>。
- 末尾に FAQ を <h2>よくある質問</h2> + 各 <h3>質問</h3><p>回答</p> で3〜5問。
- 「関連記事はこちら」程度の内部リンク誘導文を1つ入れる（具体URLは不要、テキストのみ）。
- 不明な事実は書かない。元ネタに無い日付・価格・URLを創作しない。

# tweet（拡散用ツイート文）
- 速報感のある書き出し＋核となる事実2〜3行＋「🔗記事はこちら→[記事URL]」＋ハッシュタグ。
- ハッシュタグは最大4つ（対象グループ名のタグを必ず含める）。
- 「[記事URL]」はそのままプレースホルダーとして残す。
- 本文90〜100字目安。印象表現・公式風表現は不可。

# 出力
JSON のみを返すこと（説明文や前置きは一切不要）。フィールドは title / body / tweet / category / group_slug / multiple_topics。
category は live / goods / ticket / media / other のいずれか。group_slug は Strawberry_Prince / knightX / amptak / Meteorites / SneakerStep / True_Lip のいずれか。`

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "SEOタイトル（全角32字以内・先頭固有名詞・西暦入り）" },
    body: { type: "string", description: "記事本文（HTML。リード→本文→FAQ）" },
    tweet: { type: "string", description: "拡散用ツイート文（URL・タグ込み140字以内）" },
    category: { type: "string", enum: [...NEWS_CATEGORIES] },
    group_slug: { type: "string", enum: [...GROUP_SLUGS] },
    multiple_topics: { type: "boolean", description: "元ネタに複数の発表が含まれるか" },
  },
  required: ["title", "body", "tweet", "category", "group_slug", "multiple_topics"],
  additionalProperties: false,
} as const

function isCategory(v: unknown): v is NewsDraft["category"] {
  return typeof v === "string" && (NEWS_CATEGORIES as readonly string[]).includes(v)
}
function isGroup(v: unknown): v is NewsDraft["group_slug"] {
  return typeof v === "string" && (GROUP_SLUGS as readonly string[]).includes(v)
}

/** 元ネタテキストから Claude で記事＋ツイート文を生成する。 */
export async function generateNewsDraft(sourceText: string): Promise<GenerateResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が必要です。再度ログインしてください。" }
  }

  const text = (sourceText ?? "").trim()
  if (text.length < 10) return { error: "元ネタテキストが短すぎます。" }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { error: "ANTHROPIC_API_KEY が未設定です。サーバーの環境変数に設定してください。" }
  }

  const client = new Anthropic({ apiKey })

  let raw: string
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: WRITER_SYSTEM,
      output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      messages: [
        {
          role: "user",
          content: `以下の元ネタ（X投稿・プレスリリース等のPR文）から、上記ルールに沿って記事化してください。\n\n---\n${text}\n---`,
        },
      ],
    })
    const block = res.content.find((b) => b.type === "text")
    raw = block && block.type === "text" ? block.text : ""
  } catch (e) {
    if (e instanceof Anthropic.APIError) return { error: `Claude API エラー (${e.status}): ${e.message}` }
    return { error: e instanceof Error ? e.message : "記事生成に失敗しました。" }
  }

  // 構造化出力は純粋なJSONだが、念のためコードフェンスを除去してパース。
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return { error: "生成結果の解析に失敗しました。もう一度お試しください。" }
  }

  if (
    typeof parsed.title !== "string" ||
    typeof parsed.body !== "string" ||
    typeof parsed.tweet !== "string" ||
    !isCategory(parsed.category) ||
    !isGroup(parsed.group_slug)
  ) {
    return { error: "生成結果が想定の形式ではありませんでした。" }
  }

  return {
    draft: {
      title: parsed.title,
      body: parsed.body,
      tweet: parsed.tweet,
      category: parsed.category,
      group_slug: parsed.group_slug,
      multiple_topics: parsed.multiple_topics === true,
    },
  }
}

/** 生成した記事を news テーブルに下書き保存（status=draft / 公開フラグ false）。 */
export async function saveNewsDraft(input: {
  title: string
  body: string
  tweet: string
  category: string
  group_slug: string
}): Promise<SaveResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "認証が必要です。再度ログインしてください。" }
  }

  const title = (input.title ?? "").trim()
  if (!title) return { error: "タイトルが空です。" }

  const record = {
    title,
    body: input.body ?? "",
    tweet: input.tweet ?? "",
    category: isCategory(input.category) ? input.category : "other",
    // 公開ページは group_slugs（text[]）を見るため配列で保存。
    group_slugs: isGroup(input.group_slug) ? [input.group_slug] : [],
    status: "draft", // 公開フラグはデフォルト false（下書き）
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Supabase 設定エラー" }
  }

  const { data, error } = await supabase.from("news").insert(record).select("id").maybeSingle()
  if (error) return { error: `保存に失敗しました: ${error.message}` }
  if (!data) return { error: "保存できませんでした（書き込み権限を確認してください）。" }
  return { id: String((data as { id: string }).id) }
}
