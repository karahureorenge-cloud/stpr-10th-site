/**
 * 2件の lives を更新するスクリプト（venues_json / period / title）
 * ------------------------------------------------------------------
 * slug 一致時: venues_json / period_start / period_end / title を更新（上書き）。
 * slug が無い場合は新規 insert（フォールバック）。
 *
 * 実行: npx tsx scripts/update-lives-venues-2026-2.ts
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
type Rec = { slug: string; title: string; period_start: string; period_end?: string; venues: RawVenue[] }

const RECORDS: Rec[] = [
  {
    slug: "stmemoforever",
    title: "すとろべりーめもりーVol.Forever!!『すとぷり Best Album Release Party 2025』",
    period_start: "2025-01-11",
    period_end: "2025-01-12",
    venues: [
      {
        venueName: "さいたまスーパーアリーナ",
        prefecture: "埼玉",
        shows: [
          { date: "2025-01-11", partLabel: "Party Vol.1", openTime: "10:30", startTime: "12:00" },
          { date: "2025-01-11", partLabel: "Party Vol.2", openTime: "16:30", startTime: "18:00" },
          { date: "2025-01-12", partLabel: "Party Vol.Final", openTime: "12:30", startTime: "14:00" },
        ],
      },
    ],
  },
  {
    slug: "stpr-Cover-2025",
    title: "すとぷり 歌ってみたLIVE 2025〜そろそろ歌みたも聴きたくない!?〜",
    period_start: "2025-11-15",
    period_end: "2025-11-16",
    venues: [
      {
        venueName: "Kアリーナ横浜",
        prefecture: "神奈川",
        shows: [
          { date: "2025-11-15", partLabel: "1部", openTime: "11:00", startTime: "12:30" },
          { date: "2025-11-15", partLabel: "2部", openTime: "16:30", startTime: "18:00" },
          { date: "2025-11-16", openTime: "11:00", startTime: "12:30" },
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
        .select("slug")
        .eq("slug", rec.slug)
        .maybeSingle()
      if (selErr) throw new Error(selErr.message)

      if (existing) {
        const { error } = await supabase
          .from("lives")
          .update({
            title: rec.title,
            period_start: rec.period_start,
            period_end: periodEnd,
            venues_json: venuesJson,
          })
          .eq("slug", rec.slug)
        if (error) throw new Error(error.message)
        console.log(`  ✓ UPDATE ${rec.slug} | ${rec.title} | ${rec.period_start}〜${periodEnd ?? "-"}`)
        ok++
      } else {
        const { error } = await supabase.from("lives").insert({
          slug: rec.slug,
          title: rec.title,
          period_start: rec.period_start,
          period_end: periodEnd,
          venues_json: venuesJson,
          is_10th: false,
          is_active: true,
        })
        if (error) throw new Error(error.message)
        console.log(`  + INSERT ${rec.slug}（新規） | ${rec.title}`)
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
