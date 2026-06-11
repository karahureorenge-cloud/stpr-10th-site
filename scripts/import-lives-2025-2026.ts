/**
 * 2025-2026 ライブの会場・日程 反映スクリプト
 * ------------------------------------------------------------------
 * 既存 lives レコード（slug 一致）に対して venues_json と
 * period_start / period_end のみを上書き更新する。
 * slug が存在しない場合は新規 insert（フル）する。
 *
 * 実行: npx tsx scripts/import-lives-2025-2026.ts
 * 環境: .env.local の NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY
 *
 * 注意:
 *  - 各データは「既存レコードの slug」に合わせてある（先の Wix CSV 取込の slug）。
 *  - shows の openTime / startTime は保持しつつ、表示用に scheduleText を補完。
 * ------------------------------------------------------------------
 */

import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY が .env.local にありません。")
  process.exit(1)
}

type RawShow = {
  date?: string
  partLabel?: string
  openTime?: string
  startTime?: string
}
type RawVenue = {
  venueName: string
  prefecture?: string
  shows?: RawShow[]
}
type Rec = {
  slug: string // 既存レコードの slug（一致時は venues_json と period のみ更新）
  title: string
  period_start: string
  period_end?: string
  group_slugs: string[]
  member_slugs?: string[]
  venues: RawVenue[]
}

// ── データ（slug は既存レコードに合わせる） ───────────────────────
const RECORDS: Rec[] = [
  {
    slug: "stmemoforever",
    title: "すとろべりーめもりーVol.Forever!!",
    period_start: "2025-01-11",
    period_end: "2025-01-12",
    group_slugs: ["Strawberry_Prince"],
    venues: [
      {
        venueName: "さいたまスーパーアリーナ",
        prefecture: "埼玉",
        shows: [
          { date: "2025-01-11", partLabel: "DAY1" },
          { date: "2025-01-12", partLabel: "DAY2" },
        ],
      },
    ],
  },
  {
    slug: "stprfamilyfestival",
    title: "STPR Family Festival!! in 東京ドーム・ベルーナドーム",
    period_start: "2025-04-02",
    period_end: "2025-04-06",
    group_slugs: ["Strawberry_Prince", "knightX", "amptak", "Meteorites", "SneakerStep"],
    venues: [
      {
        venueName: "東京ドーム",
        prefecture: "東京",
        shows: [
          { date: "2025-04-02", openTime: "16:00", startTime: "18:00" },
          { date: "2025-04-03", openTime: "13:00", startTime: "15:00" },
          { date: "2025-04-04", openTime: "16:00", startTime: "18:00" },
        ],
      },
      {
        venueName: "ベルーナドーム",
        prefecture: "埼玉",
        shows: [
          { date: "2025-04-05", openTime: "16:00", startTime: "18:00" },
          { date: "2025-04-06", openTime: "13:00", startTime: "15:00" },
        ],
      },
    ],
  },
  {
    slug: "77percentin Rainbow Road",
    title: "AMPTAK1stアルバムリリースライブ〜AMPTAKxレインボーロード中77%〜",
    period_start: "2025-05-05",
    period_end: "2025-05-06",
    group_slugs: ["amptak"],
    venues: [
      {
        venueName: "ぴあアリーナMM",
        prefecture: "神奈川",
        shows: [
          { date: "2025-05-05", partLabel: "Day", openTime: "11:30", startTime: "12:30" },
          { date: "2025-05-05", partLabel: "Night", openTime: "17:00", startTime: "18:00" },
          { date: "2025-05-06", partLabel: "Night", openTime: "17:00", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "FIRST1MPACT",
    title: "Meteorites 1st One Man Live -FIRST 1MPACT-",
    period_start: "2025-08-01",
    group_slugs: ["Meteorites"],
    venues: [
      {
        venueName: "日本武道館",
        prefecture: "東京",
        shows: [{ date: "2025-08-01", openTime: "16:30", startTime: "18:00" }],
      },
    ],
  },
  {
    slug: "runu-kotonoha",
    title: "言ノ葉ワンダーランド LIVE in 日本武道館",
    period_start: "2025-08-22",
    period_end: "2025-08-23",
    group_slugs: ["Strawberry_Prince"],
    member_slugs: ["rinu"],
    venues: [
      {
        venueName: "日本武道館",
        prefecture: "東京",
        shows: [
          { date: "2025-08-22", openTime: "17:00", startTime: "18:00" },
          { date: "2025-08-23", partLabel: "1部", openTime: "12:00", startTime: "13:00" },
          { date: "2025-08-23", partLabel: "2部", openTime: "17:00", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "KnightX",
    title: "騎士X - Knight X - 1st ONE MAN LIVE 2025 in 日本武道館",
    period_start: "2025-08-13",
    group_slugs: ["knightX"],
    venues: [
      {
        venueName: "日本武道館",
        prefecture: "東京",
        shows: [
          { date: "2025-08-13", partLabel: "Alice（昼）", openTime: "11:30", startTime: "12:30" },
          { date: "2025-08-13", partLabel: "Knight（夜）", openTime: "17:00", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "satomi-oneman",
    title: "Satomi ONE MAN LIVE 2025",
    period_start: "2025-09-27",
    period_end: "2025-09-28",
    group_slugs: ["Strawberry_Prince"],
    member_slugs: ["satomi"],
    venues: [
      {
        venueName: "横浜アリーナ",
        prefecture: "神奈川",
        shows: [
          { date: "2025-09-27", partLabel: "-Memories-", openTime: "12:00", startTime: "13:00" },
          { date: "2025-09-27", partLabel: "-Never End-", openTime: "17:00", startTime: "18:00" },
          { date: "2025-09-28", partLabel: "-S's-", openTime: "12:00", startTime: "13:00" },
          { date: "2025-09-28", partLabel: "-Period-", openTime: "17:00", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "stpr-Cover-2025",
    title: "すとぷり 歌ってみたLIVE 2025〜そろそろ歌みたも聴きたくない!?〜",
    period_start: "2025-11-15",
    group_slugs: ["Strawberry_Prince"],
    venues: [
      {
        venueName: "Kアリーナ横浜",
        prefecture: "神奈川",
        shows: [{ date: "2025-11-15" }],
      },
    ],
  },
  {
    slug: "rinu-kotonoha-koube",
    title: "言ノ葉ワンダーランド LIVE in 神戸ワールド記念ホール",
    period_start: "2025-12-13",
    period_end: "2025-12-14",
    group_slugs: ["Strawberry_Prince"],
    member_slugs: ["rinu"],
    venues: [
      {
        venueName: "神戸ワールド記念ホール",
        prefecture: "兵庫",
        shows: [
          { date: "2025-12-13", openTime: "17:00", startTime: "18:00" },
          { date: "2025-12-14", partLabel: "1部", openTime: "12:00", startTime: "13:00" },
          { date: "2025-12-14", partLabel: "2部", openTime: "17:00", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "1st-step",
    title: "We are SneakerStep! -1st Step-",
    period_start: "2025-12-29",
    period_end: "2026-01-06",
    group_slugs: ["SneakerStep"],
    venues: [
      {
        venueName: "Zepp Namba",
        prefecture: "大阪",
        shows: [
          { date: "2025-12-29", partLabel: "BEGINNING", openTime: "17:00", startTime: "18:00" },
          { date: "2025-12-30", partLabel: "BEGINNING", openTime: "14:00", startTime: "15:00" },
        ],
      },
      {
        venueName: "Zepp Nagoya",
        prefecture: "愛知",
        shows: [
          { date: "2026-01-02", partLabel: "CHALLENGE", openTime: "17:00", startTime: "18:00" },
          { date: "2026-01-03", partLabel: "CHALLENGE", openTime: "14:00", startTime: "15:00" },
        ],
      },
      {
        venueName: "Zepp DiverCity TOKYO",
        prefecture: "東京",
        shows: [
          { date: "2026-01-05", partLabel: "GROWTH", openTime: "17:00", startTime: "18:00" },
          { date: "2026-01-06", partLabel: "GROWTH 1部", openTime: "12:00", startTime: "13:00" },
          { date: "2026-01-06", partLabel: "GROWTH 2部", openTime: "17:00", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    // ※ ユーザーのマッピング表に無いが、同一イベントの既存 slug は colon-colone（CSV取込）。
    slug: "colon-colone",
    title: "ころわん！ -あけおめライブ2026- in さいたまスーパーアリーナ",
    period_start: "2026-01-03",
    period_end: "2026-01-04",
    group_slugs: ["Strawberry_Prince"],
    member_slugs: ["colon"],
    venues: [
      {
        venueName: "さいたまスーパーアリーナ",
        prefecture: "埼玉",
        shows: [
          { date: "2026-01-03", openTime: "16:30", startTime: "18:00" },
          { date: "2026-01-04", partLabel: "1部", openTime: "11:00", startTime: "12:30" },
          { date: "2026-01-04", partLabel: "2部", openTime: "16:30", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "your-promise",
    title: "君と僕の約束 in 国立代々木競技場第一体育館",
    period_start: "2026-02-28",
    period_end: "2026-03-01",
    group_slugs: ["Strawberry_Prince"],
    member_slugs: ["root"],
    venues: [
      {
        venueName: "国立代々木競技場第一体育館",
        prefecture: "東京",
        shows: [
          { date: "2026-02-28", partLabel: "1部", openTime: "11:30", startTime: "12:30" },
          { date: "2026-02-28", partLabel: "2部", openTime: "16:00", startTime: "17:00" },
          { date: "2026-03-01", partLabel: "1部", openTime: "11:30", startTime: "12:30" },
          { date: "2026-03-01", partLabel: "2部", openTime: "16:00", startTime: "17:00" },
        ],
      },
    ],
  },
  {
    slug: "88percentin Rainbow Road",
    title: "AMPTAK海賊団xレインボーロード中88％",
    period_start: "2026-03-20",
    period_end: "2026-03-21",
    group_slugs: ["amptak"],
    venues: [
      {
        venueName: "Kアリーナ横浜",
        prefecture: "神奈川",
        shows: [
          { date: "2026-03-20", openTime: "12:00", startTime: "13:30" },
          { date: "2026-03-21", openTime: "12:00", startTime: "13:30" },
        ],
      },
    ],
  },
  {
    slug: "thekings",
    title: "Meteorites 2nd One Man Live -THE KINGS-",
    period_start: "2026-03-22",
    period_end: "2026-03-23",
    group_slugs: ["Meteorites"],
    venues: [
      {
        venueName: "Kアリーナ横浜",
        prefecture: "神奈川",
        shows: [
          { date: "2026-03-22", openTime: "14:30", startTime: "16:00" },
          { date: "2026-03-23", openTime: "16:30", startTime: "18:00" },
        ],
      },
    ],
  },
]

// ── ヘルパ ─────────────────────────────────────────────────────────
/** openTime / startTime を保持しつつ、表示用 scheduleText を補完した venues_json を作る。 */
function buildVenuesJson(venues: RawVenue[]): RawVenue[] {
  return venues.map((v) => ({
    ...v,
    shows: (v.shows ?? []).map((s) => {
      const open = s.openTime?.trim()
      const start = s.startTime?.trim()
      let scheduleText: string | undefined
      if (open && start) scheduleText = `開場${open}/開演${start}`
      else if (start) scheduleText = `開演${start}`
      else if (open) scheduleText = `開場${open}`
      return scheduleText ? { ...s, scheduleText } : { ...s }
    }),
  }))
}

// ── メイン ─────────────────────────────────────────────────────────
async function main() {
  const supabase = createClient(SUPABASE_URL as string, SUPABASE_SECRET_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let updated = 0
  let inserted = 0
  let fail = 0

  for (const rec of RECORDS) {
    const venuesJson = buildVenuesJson(rec.venues)
    const periodEnd = rec.period_end ?? null

    try {
      const { data: existing, error: selErr } = await supabase
        .from("lives")
        .select("slug")
        .eq("slug", rec.slug)
        .maybeSingle()
      if (selErr) throw new Error(selErr.message)

      if (existing) {
        // 既存：venues_json と period_start / period_end のみ上書き。
        const { error } = await supabase
          .from("lives")
          .update({
            venues_json: venuesJson,
            period_start: rec.period_start,
            period_end: periodEnd,
          })
          .eq("slug", rec.slug)
        if (error) throw new Error(error.message)
        console.log(`  ✓ UPDATE ${rec.slug} | ${rec.title} | ${rec.period_start}〜${periodEnd ?? "-"}`)
        updated++
      } else {
        // 新規：フル insert。
        const { error } = await supabase.from("lives").insert({
          slug: rec.slug,
          title: rec.title,
          period_start: rec.period_start,
          period_end: periodEnd,
          group_slugs: rec.group_slugs,
          group_slug: rec.group_slugs[0] ?? null,
          member_slugs: rec.member_slugs ?? [],
          venues_json: venuesJson,
          is_10th: false,
          is_active: true,
          is_family: rec.group_slugs.includes("stpr_family"),
        })
        if (error) throw new Error(error.message)
        console.log(`  + INSERT ${rec.slug} | ${rec.title}`)
        inserted++
      }
    } catch (e) {
      console.error(`  ✗ ${rec.slug}: ${e instanceof Error ? e.message : String(e)}`)
      fail++
    }
  }

  console.log(
    `\n完了: 更新 ${updated} 件 / 新規 ${inserted} 件 / 失敗 ${fail} 件（対象 ${RECORDS.length} 件）`,
  )
  if (fail > 0) process.exitCode = 1
}

main().catch((e) => {
  console.error("致命的エラー:", e instanceof Error ? e.message : e)
  process.exit(1)
})
