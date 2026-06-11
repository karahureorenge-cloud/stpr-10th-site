/**
 * Wix エクスポート CSV → Supabase lives テーブル 取込スクリプト
 * ------------------------------------------------------------------
 * scripts/ライブ.csv を読み、slug をキーに Supabase lives へ upsert する。
 *
 * 実行方法:
 *   npx tsx scripts/import-from-wix-csv.ts
 *
 * 事前準備:
 *   - scripts/ライブ.csv を配置（Wix CSV エクスポート）
 *   - .env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY
 *
 * 仕様:
 *   - is_10th = false / is_active = true 固定
 *   - slug は URL 列。バッチ内重複は末尾に -2,-3 を付与
 *   - period_start は和暦混じり日付文字列をパース（年月のみは1日）
 *   - タグ（JSON配列）→ group_slugs / member_slugs にマッピング
 *   - 既存レコードは slug で upsert（onConflict: slug）
 * ------------------------------------------------------------------
 */

import { readFileSync } from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY が .env.local にありません。")
  process.exit(1)
}

const CSV_PATH = path.join(process.cwd(), "scripts", "ライブ.csv")

// ── マッピング ─────────────────────────────────────────────────────
const GROUP_MAP: Record<string, string> = {
  騎士A: "knightA",
  騎士X: "knightX",
  すとぷり: "Strawberry_Prince",
  AMPTAK: "amptak",
  めておら: "Meteorites",
  すにすて: "SneakerStep",
  とぅるりぷ: "True_Lip",
  STPR: "stpr_family",
  "STPR Family": "stpr_family",
}

const MEMBER_MAP: Record<string, string> = {
  莉犬: "rinu",
  るぅと: "root",
  ころん: "colon",
  さとみ: "satomi",
  ジェル: "jel",
  ななもり: "nanamori",
}

// ── CSV パーサ（RFC4180：引用符・改行・""エスケープ対応） ──────────
function parseCsv(input: string): string[][] {
  let text = input
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1) // BOM 除去
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
      continue
    }
    if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\r") {
      // 無視（\r\n の \n 側で行確定）
    } else if (c === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// ── 値ヘルパ ───────────────────────────────────────────────────────
function nz(v: unknown): string | null {
  const s = v == null ? "" : String(v).trim()
  return s === "" ? null : s
}

/** 和暦混じり日付文字列 → "YYYY-MM-DD"。年月のみは1日。パース不能は null。 */
function parseJpDate(s?: string): string | null {
  if (!s) return null
  const m = /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})?\s*日?/.exec(s.trim())
  if (!m) return null
  const y = m[1]
  const mo = m[2].padStart(2, "0")
  const d = (m[3] ?? "1").padStart(2, "0")
  return `${y}-${mo}-${d}`
}

/** wix:image://v1/<mediaId>/<orig>#... → 公開URL。通常URLはそのまま。 */
function wixImageUrl(s?: string): string | null {
  const t = (s ?? "").trim()
  if (!t) return null
  if (t.startsWith("wix:image://")) {
    const after = t.replace(/^wix:image:\/\/v1\//, "")
    const mediaId = after.split("/")[0].split("#")[0]
    return mediaId ? `https://static.wixstatic.com/media/${mediaId}` : null
  }
  return /^https?:\/\//.test(t) ? t : null
}

/** タグ列（JSON配列文字列）→ 文字列配列。 */
function parseTags(s?: string): string[] {
  const t = (s ?? "").trim()
  if (!t) return []
  try {
    const arr = JSON.parse(t)
    if (Array.isArray(arr)) return arr.map((x) => String(x).trim()).filter(Boolean)
  } catch {
    /* フォールバックへ */
  }
  return t
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((x) => x.replace(/^["']|["']$/g, "").trim())
    .filter(Boolean)
}

function parseSort(s?: string): number {
  const n = parseInt(String(s ?? "").trim(), 10)
  return Number.isFinite(n) ? n : 0
}

/** URL 列が空のときのフォールバック slug。 */
function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9぀-ヿ一-龯]+/g, "-")
      .replace(/^-+|-+$/g, "") || "live"
  )
}

// ── メイン ─────────────────────────────────────────────────────────
async function main() {
  const text = readFileSync(CSV_PATH, "utf8")
  const table = parseCsv(text)
  if (table.length < 2) {
    console.error("CSV にデータ行がありません。")
    process.exit(1)
  }

  const header = table[0]
  const col = (name: string) => header.indexOf(name)
  const cTitle = col("Title")
  const cDate = col("日付")
  const cImage = col("Image")
  const cSubtitle = col("Subtitle")
  const cUrl = col("URL")
  const cSort = col("並び変え用(年＋月)")
  const cTags = col("タグ")

  const usedSlugs = new Set<string>()
  const uniqueSlug = (base: string): string => {
    let s = base
    let n = 2
    while (usedSlugs.has(s)) s = `${base}-${n++}`
    usedSlugs.add(s)
    return s
  }

  const supabase = createClient(SUPABASE_URL as string, SUPABASE_SECRET_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let ok = 0
  let fail = 0
  const unknownTags = new Set<string>()

  for (let r = 1; r < table.length; r++) {
    const cells = table[r]
    const title = nz(cells[cTitle])
    const rawUrl = nz(cells[cUrl])
    if (!title && !rawUrl) continue // 完全空行はスキップ

    const baseSlug = rawUrl ?? slugify(title ?? `live-${r}`)
    const slug = uniqueSlug(baseSlug)

    // タグ → group_slugs / member_slugs
    const groupSlugs = new Set<string>()
    const memberSlugs = new Set<string>()
    for (const tag of parseTags(cells[cTags])) {
      if (MEMBER_MAP[tag]) {
        memberSlugs.add(MEMBER_MAP[tag])
        groupSlugs.add("Strawberry_Prince") // メンバー個人 → すとぷり所属
      } else if (GROUP_MAP[tag]) {
        groupSlugs.add(GROUP_MAP[tag])
      } else {
        unknownTags.add(tag)
      }
    }
    const groups = [...groupSlugs]

    const row = {
      slug,
      title: title ?? slug,
      subtitle: nz(cells[cSubtitle]),
      period_start: parseJpDate(cells[cDate]),
      key_visual_url: wixImageUrl(cells[cImage]),
      group_slugs: groups,
      group_slug: groups[0] ?? null,
      member_slugs: [...memberSlugs],
      is_10th: false,
      is_active: true,
      is_family: groups.includes("stpr_family"),
      sort_order: parseSort(cells[cSort]),
    }

    try {
      const { error } = await supabase.from("lives").upsert(row, { onConflict: "slug" })
      if (error) {
        console.error(`  ✗ ${slug}: ${error.message}`)
        fail++
      } else {
        console.log(
          `  ✓ ${slug} | ${row.title} | ${row.period_start ?? "日付なし"} | groups=[${groups.join(",")}] members=[${row.member_slugs.join(",")}]`,
        )
        ok++
      }
    } catch (e) {
      console.error(`  ✗ ${slug}: ${e instanceof Error ? e.message : String(e)}`)
      fail++
    }
  }

  if (unknownTags.size > 0) {
    console.warn(`\n⚠ 未マッピングのタグ（無視）: ${[...unknownTags].join(", ")}`)
  }
  console.log(`\n完了: 成功 ${ok} 件 / 失敗 ${fail} 件`)
  if (fail > 0) process.exitCode = 1
}

main().catch((e) => {
  console.error("致命的エラー:", e instanceof Error ? e.message : e)
  process.exit(1)
})
