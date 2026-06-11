/**
 * 4件の lives に会場・日程を反映するスクリプト
 * ------------------------------------------------------------------
 * slug 一致時:
 *   - period_start / period_end は常に更新
 *   - venues_json は既存が空のときのみ更新（既に入っていれば上書きしない）
 * slug が無い場合は新規 insert（フォールバック）。
 *
 * 実行: npx tsx scripts/update-lives-venues-2026.ts
 * 環境: .env.local の NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY
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

type RawShow = { date?: string; partLabel?: string; openTime?: string; startTime?: string }
type RawVenue = { venueName: string; prefecture?: string; shows?: RawShow[] }
type Rec = { slug: string; period_start: string; period_end?: string; venues: RawVenue[] }

const RECORDS: Rec[] = [
  {
    slug: "FirstKiss",
    period_start: "2026-04-25",
    period_end: "2026-04-26",
    venues: [
      {
        venueName: "harevutai",
        prefecture: "東京",
        shows: [
          { date: "2026-04-25", partLabel: "1部", openTime: "12:30", startTime: "13:00" },
          { date: "2026-04-25", partLabel: "2部", openTime: "17:30", startTime: "18:00" },
          { date: "2026-04-26", partLabel: "1部", openTime: "12:30", startTime: "13:00" },
          { date: "2026-04-26", partLabel: "2部", openTime: "17:30", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "kissagain",
    period_start: "2026-06-12",
    period_end: "2026-06-13",
    venues: [
      {
        venueName: "harevutai",
        prefecture: "東京",
        shows: [
          { date: "2026-06-12", partLabel: "1部", openTime: "12:30", startTime: "13:00" },
          { date: "2026-06-12", partLabel: "2部", openTime: "17:30", startTime: "18:00" },
          { date: "2026-06-13", partLabel: "1部", openTime: "12:30", startTime: "13:00" },
          { date: "2026-06-13", partLabel: "2部", openTime: "17:30", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "we-are-snst-2",
    period_start: "2026-07-27",
    period_end: "2026-08-22",
    venues: [
      {
        venueName: "KT Zepp Yokohama",
        prefecture: "神奈川",
        shows: [
          { date: "2026-07-27", partLabel: "SPARK", openTime: "17:00", startTime: "18:00" },
          { date: "2026-07-28", partLabel: "SPARK 1部", openTime: "11:00", startTime: "12:00" },
          { date: "2026-07-28", partLabel: "SPARK 2部", openTime: "17:00", startTime: "18:00" },
        ],
      },
      {
        venueName: "Zepp Nagoya",
        prefecture: "愛知",
        shows: [
          { date: "2026-08-04", partLabel: "ACCEL", openTime: "17:00", startTime: "18:00" },
          { date: "2026-08-05", partLabel: "ACCEL 1部", openTime: "11:00", startTime: "12:00" },
          { date: "2026-08-05", partLabel: "ACCEL 2部", openTime: "17:00", startTime: "18:00" },
        ],
      },
      {
        venueName: "Zepp Namba",
        prefecture: "大阪",
        shows: [
          { date: "2026-08-16", partLabel: "LINK", openTime: "17:00", startTime: "18:00" },
          { date: "2026-08-17", partLabel: "LINK 1部", openTime: "11:00", startTime: "12:00" },
          { date: "2026-08-17", partLabel: "LINK 2部", openTime: "17:00", startTime: "18:00" },
        ],
      },
      {
        venueName: "Zepp Fukuoka",
        prefecture: "福岡",
        shows: [
          { date: "2026-08-21", partLabel: "STEP UP", openTime: "17:00", startTime: "18:00" },
          { date: "2026-08-22", partLabel: "STEP UP 1部", openTime: "11:00", startTime: "12:00" },
          { date: "2026-08-22", partLabel: "STEP UP 2部", openTime: "17:00", startTime: "18:00" },
        ],
      },
    ],
  },
  {
    slug: "tire-1",
    period_start: "2026-11-06",
    period_end: "2027-01-03",
    venues: [
      {
        venueName: "なんばHatch",
        prefecture: "大阪",
        shows: [
          { date: "2026-11-06", openTime: "17:00", startTime: "18:00" },
          { date: "2026-11-07", openTime: "14:00", startTime: "15:00" },
        ],
      },
      {
        venueName: "豊洲PIT",
        prefecture: "東京",
        shows: [
          { date: "2026-12-30", openTime: "17:00", startTime: "18:00" },
          { date: "2026-12-31", openTime: "14:00", startTime: "15:00" },
        ],
      },
      {
        venueName: "COMTEC PORTBASE",
        prefecture: "愛知",
        shows: [
          { date: "2027-01-02", openTime: "17:00", startTime: "18:00" },
          { date: "2027-01-03", openTime: "14:00", startTime: "15:00" },
        ],
      },
    ],
  },
]

/** openTime / startTime を保持しつつ表示用 scheduleText を補完。 */
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

/** 既存 venues_json が「空」か（null / 非配列 / 空配列）。 */
function isEmptyVenues(v: unknown): boolean {
  return !Array.isArray(v) || v.length === 0
}

async function main() {
  const supabase = createClient(SUPABASE_URL as string, SUPABASE_SECRET_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let ok = 0
  let fail = 0

  for (const rec of RECORDS) {
    const venuesJson = buildVenuesJson(rec.venues)
    const periodEnd = rec.period_end ?? null

    try {
      const { data: existing, error: selErr } = await supabase
        .from("lives")
        .select("slug, venues_json")
        .eq("slug", rec.slug)
        .maybeSingle()
      if (selErr) throw new Error(selErr.message)

      if (existing) {
        const venuesEmpty = isEmptyVenues((existing as { venues_json?: unknown }).venues_json)
        const patch: Record<string, unknown> = {
          period_start: rec.period_start,
          period_end: periodEnd,
        }
        if (venuesEmpty) patch.venues_json = venuesJson

        const { error } = await supabase.from("lives").update(patch).eq("slug", rec.slug)
        if (error) throw new Error(error.message)

        console.log(
          `  ✓ ${rec.slug} | period更新${venuesEmpty ? " + venues_json更新" : "（venues_json は既存ありのため保持）"} | ${rec.period_start}〜${periodEnd ?? "-"}`,
        )
        ok++
      } else {
        const { error } = await supabase.from("lives").insert({
          slug: rec.slug,
          title: rec.slug,
          period_start: rec.period_start,
          period_end: periodEnd,
          venues_json: venuesJson,
          is_10th: false,
          is_active: true,
        })
        if (error) throw new Error(error.message)
        console.log(`  + INSERT ${rec.slug}（新規） | ${rec.period_start}〜${periodEnd ?? "-"}`)
        ok++
      }
    } catch (e) {
      console.error(`  ✗ ${rec.slug}: ${e instanceof Error ? e.message : String(e)}`)
      fail++
    }
  }

  console.log(`\n完了: 成功 ${ok} 件 / 失敗 ${fail} 件（対象 ${RECORDS.length} 件）`)
  if (fail > 0) process.exitCode = 1
}

main().catch((e) => {
  console.error("致命的エラー:", e instanceof Error ? e.message : e)
  process.exit(1)
})
