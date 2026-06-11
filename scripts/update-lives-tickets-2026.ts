/**
 * 3件の lives のチケット情報を更新するスクリプト
 * ------------------------------------------------------------------
 * slug 一致時: ticket_info / ticket_lineup / official_site_url を上書き更新。
 * venues_json は更新しない。slug が無い場合は新規 insert（フォールバック）。
 *
 * 実行: npx tsx scripts/update-lives-tickets-2026.ts
 * 環境: .env.local の NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY
 *
 * 注: ticket_lineup / ticket_info は指定された JSON をそのまま保存する。
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

type Rec = {
  slug: string
  title: string // insert フォールバック用
  official_site_url: string
  ticket_lineup: Record<string, unknown>[]
  ticket_info: Record<string, unknown>[]
}

const RECORDS: Rec[] = [
  {
    slug: "88percentin Rainbow Road",
    title: "AMPTAK海賊団xレインボーロード中88％",
    official_site_url: "https://amptak-colors-k-arena2026.stpr.com/",
    ticket_lineup: [
      { name: "一般指定席", price: 8800, saleType: "抽選" },
      { name: "ファミリー席", price: 7700, saleType: "抽選" },
      {
        name: "スペシャルグッズ付き指定席",
        price: 15000,
        saleType: "抽選",
        note: "アップグレード料金+6,200円。アンプタックラブ!!最速先行の一般指定席当選者のみ。アリーナ席確約＋スペシャルグッズ",
      },
      {
        name: "ライブ・ビューイング",
        price: 4500,
        saleType: "先着",
        note: "全席指定。全国各地の映画館にて3/21公演を生中継",
      },
    ],
    ticket_info: [
      {
        name: "アンプタックラブ!!最速先行",
        saleType: "抽選",
        sale_start: "2026-01-12T20:30:00+09:00",
        sale_end: "2026-01-25T23:59:00+09:00",
      },
      {
        name: "オフィシャル先行",
        saleType: "抽選",
        sale_start: "2026-01-31T21:00:00+09:00",
        sale_end: "2026-02-08T23:59:00+09:00",
      },
      {
        name: "スペシャルグッズ付き指定席アップグレード受付",
        saleType: "抽選",
        note: "アンプタックラブ!!最速先行で一般指定席当選・入金者のみ",
      },
      {
        name: "STPR TICKET機材開放販売",
        saleType: "先着",
        sale_start: "2026-02-28T22:00:00+09:00",
        sale_end: "2026-03-20T18:00:00+09:00",
        note: "SOLD OUT",
      },
      {
        name: "ライブ・ビューイング 映画館販売",
        saleType: "先着",
        sale_start: "2026-03-18T00:00:00+09:00",
      },
    ],
  },
  {
    slug: "thekings",
    title: "Meteorites 2nd One Man Live -THE KINGS-",
    official_site_url: "https://meteorites-k-arena2026.stpr.com/",
    ticket_lineup: [
      { name: "一般指定席", price: 8800, saleType: "抽選" },
      { name: "ファミリー席", price: 7700, saleType: "抽選" },
      {
        name: "スペシャルグッズ付き指定席",
        price: 15000,
        saleType: "抽選",
        note: "アップグレード料金+6,200円。Stella Nova最速先行の一般指定席当選者のみ。アリーナ席確約＋スペシャルグッズ",
      },
    ],
    ticket_info: [
      {
        name: "Stella Nova最速先行",
        saleType: "抽選",
        sale_start: "2026-01-16T22:00:00+09:00",
        sale_end: "2026-01-25T23:59:00+09:00",
      },
      {
        name: "スペシャルグッズ付き指定席アップグレード受付",
        saleType: "抽選",
        sale_start: "2026-02-15T23:00:00+09:00",
        sale_end: "2026-02-23T23:59:00+09:00",
        note: "Stella Nova最速先行で一般指定席当選・入金者のみ",
      },
      {
        name: "STPR TICKET・プレイガイド受付",
        saleType: "抽選",
        sale_start: "2026-02-15T23:00:00+09:00",
        sale_end: "2026-02-23T23:59:00+09:00",
      },
      { name: "オフィシャル先行", saleType: "抽選" },
      {
        name: "STPR TICKET機材開放販売",
        saleType: "先着",
        sale_start: "2026-03-02T00:00:00+09:00",
        note: "日曜公演：〜3/21(土)18:00、月曜公演：〜3/22(日)18:00",
      },
    ],
  },
  {
    slug: "we-are-snst-2",
    title: "We are SneakerStep! -2nd Step-",
    official_site_url: "https://sneakerstep-zepptour2026.stpr.com/",
    ticket_lineup: [
      {
        name: "1階アリーナ（スタンディング）",
        price: 8800,
        saleType: "抽選",
        note: "整理番号順入場。未就学児入場不可",
      },
      { name: "2階指定席", price: 7700, saleType: "抽選" },
      { name: "2階後方スタンディング", price: 7700, saleType: "抽選" },
      { name: "2階ファミリー席（着席指定）", price: 6600, saleType: "抽選" },
      {
        name: "ハイタッチ&スペシャルグッズ付き1階アリーナ",
        price: 15000,
        saleType: "抽選",
        note: "アップグレード料金+6,200円。ROOMMATES最速先行の1階アリーナ当選者のみ。終演後ハイタッチ＋スペシャルグッズ",
      },
      { name: "別途ドリンク代", price: 600, note: "全券種必須" },
    ],
    ticket_info: [
      {
        name: "ROOMMATES最速先行",
        saleType: "抽選",
        sale_start: "2026-04-12T20:00:00+09:00",
        sale_end: "2026-04-26T23:59:00+09:00",
      },
      {
        name: "ハイタッチ&スペシャルグッズ付き1階アリーナ アップグレード受付",
        saleType: "抽選",
        note: "ROOMMATES最速先行で1階アリーナ当選・入金者のみ",
      },
      {
        name: "STPR TICKET・プレイガイド最終先着販売",
        saleType: "先着",
        sale_start: "2026-06-07T20:00:00+09:00",
        sale_end: "2026-06-21T23:59:00+09:00",
        note: "対象公演・券種あり。1階アリーナ8,800円・2階指定席7,700円・2階後方スタンディング7,700円",
      },
    ],
  },
]

async function main() {
  const supabase = createClient(SUPABASE_URL as string, SUPABASE_SECRET_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let ok = 0
  let fail = 0

  for (const rec of RECORDS) {
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
            ticket_info: rec.ticket_info,
            ticket_lineup: rec.ticket_lineup,
            official_site_url: rec.official_site_url,
          })
          .eq("slug", rec.slug)
        if (error) throw new Error(error.message)
        console.log(
          `  ✓ UPDATE ${rec.slug} | ${rec.title} | lineup ${rec.ticket_lineup.length} / info ${rec.ticket_info.length}`,
        )
        ok++
      } else {
        const { error } = await supabase.from("lives").insert({
          slug: rec.slug,
          title: rec.title,
          ticket_info: rec.ticket_info,
          ticket_lineup: rec.ticket_lineup,
          official_site_url: rec.official_site_url,
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
