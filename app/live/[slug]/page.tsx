import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLiveBySlug } from "@/lib/repo"
import { getGroupName } from "@/data/groups"
import { MEMBERS } from "@/data/members"
import { formatDateDot, formatPeriod, getLiveStatus, getTicketStatus } from "@/lib/utils"
import type { Live, Venue, TicketInfo, TicketLineup, TicketSalesOutlet, SetlistItem } from "@/data/lives"
import SetlistSelector from "@/components/live/SetlistSelector"
import JapanVenueMap, { type VenueMapItem } from "@/components/live/JapanVenueMap"
import { VENUE_COLORS } from "@/components/live/venue-colors"
import ReportFlipBook from "@/components/live/ReportFlipBook"
import HeroCountdown from "@/components/live/HeroCountdown"
import MemberIconRow from "@/components/live/MemberIconRow"
import ImageGallery from "@/components/common/ImageGallery"

type Params = { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const live = await getLiveBySlug(slug)
  if (!live) return { title: "ライブが見つかりません" }
  return {
    title: live.title,
    description: live.description ?? undefined,
    openGraph: { title: live.title, images: live.keyVisual ? [live.keyVisual] : [] },
  }
}

const PLAYGUIDE_PLATFORMS = "イープラス・チケットぴあ・ローソンチケット"

// ── 小物 ───────────────────────────────────────────────────────────
function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5 flex items-center gap-2.5 border-b-2 border-gray-200 pb-3">
      <span aria-hidden className="h-[18px] w-[3px] shrink-0 rounded-sm bg-accent-600" />
      <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-900">{title}</h2>
      {sub && <span className="ml-auto text-[11px] text-gray-500">{sub}</span>}
    </div>
  )
}

/** HERO のバッジ群（グループ / 種別 / Family / ステータス）。暗い背景前提。 */
function HeroBadges({ live, status }: { live: Live; status: ReturnType<typeof getLiveStatus> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {live.groupSlug && (
        <span className="rounded bg-accent-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
          {getGroupName(live.groupSlug)}
        </span>
      )}
      {live.liveType && (
        <span className="rounded border border-white/30 bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white">
          {live.liveType}
        </span>
      )}
      {live.isFamily && (
        <span className="rounded bg-rose-400 px-2.5 py-1 text-[11px] font-bold text-white">
          STPR Family
        </span>
      )}
      <span
        className={`rounded px-2.5 py-1 text-[11px] font-bold text-white ${
          status === "ongoing"
            ? "bg-green-500"
            : status === "coming"
              ? "bg-blue-500"
              : "bg-gray-500/80"
        }`}
      >
        {status === "ongoing" ? "● LIVE NOW" : status === "coming" ? "COMING SOON" : "FINISHED"}
      </span>
    </div>
  )
}

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
function dayBadge(dateStr?: string): { label: string; cls: string } | null {
  if (!dateStr) return null
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(d.getTime())) return null
  const day = d.getDay()
  const cls =
    day === 0
      ? "bg-rose-100 text-rose-600"
      : day === 6 || day === 5
        ? "bg-blue-100 text-blue-600"
        : "bg-gray-100 text-gray-500"
  return { label: DAY_LABELS[day], cls }
}

function outletDisplayName(name?: string): string {
  const n = (name ?? "").trim()
  if (!n) return "販売場所"
  if (n.includes("プレイガイド") && !n.includes("イープラス")) {
    return `${n}（${PLAYGUIDE_PLATFORMS}）`
  }
  return n
}

// ── ページ ─────────────────────────────────────────────────────────
export default async function LiveDetailPage({ params }: Params) {
  const { slug } = await params
  const live = await getLiveBySlug(slug)
  if (!live || live.isActive === false) notFound()

  const status = getLiveStatus(live.periodStart, live.periodEnd)
  const venues = live.venues ?? []
  const members = MEMBERS.filter((m) => (live.memberSlugs ?? []).includes(m.id))

  // 公演総数（会場ごとの shows 合計。shows 無しは1公演扱い）
  const showCount = venues.reduce(
    (sum, v) => sum + (v.shows && v.shows.length > 0 ? v.shows.length : 1),
    0,
  )

  const mapVenues: VenueMapItem[] = venues.map((v) => ({
    name: v.venueName,
    prefecture: v.prefecture,
    dateLabel: venueDateLabel(v),
  }))

  const reportImages = (live.reportGallery ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s))

  return (
    <div className="space-y-12">
      {/* ===== HERO ===== */}
      {/* KV はトリミングせず本来の比率を維持。
          スマホ: 画像を全幅でそのまま表示 → 情報パネルを下に。
          PC: 情報パネル（左）＋画像（右・contain で全体表示）の分割。 */}
      <section>
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* KV（画像の比率を維持） */}
          <div className="relative flex items-center justify-center overflow-hidden bg-gray-900 lg:order-2 lg:min-h-[420px]">
            {live.keyVisual ? (
              <>
                {/* PC: contain の余白をブラー背景で埋める（額装風） */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={live.keyVisual}
                  alt=""
                  aria-hidden
                  className="hidden lg:absolute lg:inset-0 lg:block lg:h-full lg:w-full lg:scale-110 lg:object-cover lg:opacity-60 lg:blur-2xl"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={live.keyVisual}
                  alt={live.title}
                  className="relative block w-full lg:absolute lg:inset-0 lg:h-full lg:w-full lg:object-contain"
                />
              </>
            ) : (
              <div className="aspect-video w-full bg-gradient-to-br from-accent-500 to-accent-700 lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" />
            )}
          </div>

          {/* 情報パネル */}
          <div className="relative flex flex-col gap-4 bg-gradient-to-br from-accent-700 to-accent-900 p-6 text-white lg:order-1 lg:justify-center lg:gap-5 lg:p-10 xl:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_55%)]"
            />
            <div className="relative">
              <HeroBadges live={live} status={status} />
            </div>
            <h1 className="relative text-2xl font-extrabold leading-[1.15] tracking-tight md:text-3xl lg:text-4xl xl:text-[3.1rem]">
              {live.title}
            </h1>
            {live.subtitle && (
              <p className="relative -mt-1 text-sm text-white/70 lg:text-base">{live.subtitle}</p>
            )}
            <div className="relative flex flex-col gap-1 text-sm">
              <span className="font-medium text-white/90">
                {formatPeriod(live.periodStart, live.periodEnd)}
              </span>
              {venues.length > 0 && (
                <span className="text-white/70">
                  {venues.length}会場 {showCount}公演
                </span>
              )}
              {live.hashtag && <span className="text-white/55">{live.hashtag}</span>}
            </div>
            {status === "coming" && (
              <div className="relative">
                <HeroCountdown target={live.periodStart} />
              </div>
            )}
            {live.officialSiteUrl && (
              <a
                href={live.officialSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-accent-700 shadow-sm transition-colors hover:bg-white/90 lg:px-6 lg:py-3"
              >
                公式サイト ↗
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ===== MEMBERS ===== */}
      {members.length > 0 && (
        <section>
          <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">
            MEMBERS
          </p>
          <MemberIconRow members={members} />
        </section>
      )}

      {/* 説明 */}
      {live.description && (
        <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {live.description}
        </p>
      )}

      {/* ===== 会場・公演スケジュール（日本地図） ===== */}
      {venues.length > 0 && (
        <section>
          <SectionHeading title="会場・公演スケジュール" sub={`${venues.length}会場 / ${showCount}公演`} />
          <JapanVenueMap venues={mapVenues} />
        </section>
      )}

      {/* ===== 公演情報（VenueBlock） ===== */}
      {venues.length > 0 && (
        <section>
          <SectionHeading title="公演情報" />
          <div className="space-y-4">
            {venues.map((v, i) => (
              <VenueBlock
                key={i}
                venue={v}
                index={i}
                live={live}
                baseSetlist={venues.length === 1 ? live.setlist : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===== チケット情報 ===== */}
      {((live.ticketLineup && live.ticketLineup.length > 0) ||
        (live.ticketInfo && live.ticketInfo.length > 0) ||
        (live.upgradeGoodsInfo && live.upgradeGoodsInfo.length > 0)) && (
        <section>
          <SectionHeading title="チケット情報" />
          {/* PC は 種別・料金 / スケジュール を2カラム、モバイルは縦積み */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
            {live.ticketLineup && live.ticketLineup.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <CardHead title="チケット種別・料金" />
                <div className="px-4 py-3">
                  {live.ticketLineup.map((t, i) => (
                    <TicketLineupRow key={i} t={t} />
                  ))}
                </div>
              </div>
            )}
            {live.ticketInfo && live.ticketInfo.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <CardHead title="TICKETスケジュール" />
                <div className="flex flex-col gap-2 px-4 py-3">
                  {[...live.ticketInfo].reverse().map((t, i) => (
                    <TicketScheduleItem key={i} ticket={t} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* アップグレード券の特典グッズ（通常の物販とは別物） */}
          {live.upgradeGoodsInfo && live.upgradeGoodsInfo.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-accent-100 bg-accent-50/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent-700">
                アップグレード特典グッズ
              </p>
              <p className="mb-3 mt-1 text-xs text-gray-500">
                アップグレード券の当選・購入者に付いてくる特典グッズです。
              </p>
              {/* 説明インフォグラフィックなので、読めるよう少ない列数で大きく表示 */}
              <ImageGallery
                images={live.upgradeGoodsInfo}
                columnsClassName="columns-1 gap-3 sm:columns-2"
              />
            </div>
          )}
        </section>
      )}

      {/* ===== グッズ情報 ===== */}
      {((live.goodsImages && live.goodsImages.length > 0) ||
        (live.goodsReceiveMethods && live.goodsReceiveMethods.length > 0) ||
        live.commonVenueLimitedGoods ||
        live.commonVenueLimitedItems) && (
        <section>
          <SectionHeading title="グッズ情報" />
          {live.goodsImages && live.goodsImages.length > 0 && (
            <div className="mb-3">
              {/* 元画像のアスペクト比を維持＋クリックでライトボックス拡大 */}
              <ImageGallery images={live.goodsImages} />
            </div>
          )}
          {live.goodsReceiveMethods && live.goodsReceiveMethods.length > 0 && (
            <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {live.goodsReceiveMethods.map((m, i) => (
                <div key={i} className="border-b border-gray-200 p-3.5 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-gray-800">{m.method || "受付"}</span>
                    {m.purchaseUrl && (
                      <a
                        href={m.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-accent-600/25 px-2.5 py-1 text-[11px] text-accent-600"
                      >
                        申込・購入 ↗
                      </a>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                    {m.salePeriod && <p>受付期間：{m.salePeriod}</p>}
                    {m.deliveryInfo && <p className="whitespace-pre-wrap">配送・受取：{m.deliveryInfo}</p>}
                    {m.purchaseBonus && <p>購入特典：{m.purchaseBonus}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {(live.commonVenueLimitedGoods || live.commonVenueLimitedItems) && (
            <div className="space-y-3">
              {live.commonVenueLimitedGoods && (
                <LimitedBlock title="会場限定グッズ（全会場共通）" html={live.commonVenueLimitedGoods} />
              )}
              {live.commonVenueLimitedItems && (
                <LimitedBlock title="会場限定配布物（全会場共通）" html={live.commonVenueLimitedItems} />
              )}
            </div>
          )}
        </section>
      )}

      {/* ===== FC情報・ライブビューイング・PPV ===== */}
      {((live.fcInfo && live.fcInfo.length > 0) ||
        (live.liveViewing && live.liveViewing.length > 0) ||
        (live.ppvInfo && live.ppvInfo.length > 0)) && (
        <section>
          <SectionHeading title="FC・配信情報" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {live.fcInfo && live.fcInfo.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <CardHead title="FC情報" />
                <div className="grid grid-cols-1 gap-2 p-3">
                  {live.fcInfo.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt={`FC情報${i + 1}`} className="w-full rounded-md" />
                  ))}
                </div>
              </div>
            )}
            {live.liveViewing && live.liveViewing.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <CardHead title="ライブビューイング" />
                <div className="space-y-3 p-3.5 text-sm text-gray-600">
                  {live.liveViewing.map((lv, i) => (
                    <div key={i}>
                      {lv.title && <p className="font-bold text-gray-800">{lv.title}</p>}
                      {lv.screeningDate && <p>{lv.screeningDate}</p>}
                      {lv.price && <p>{lv.price}</p>}
                      {lv.info && <p className="whitespace-pre-wrap text-xs text-gray-500">{lv.info}</p>}
                      <div className="mt-1 flex flex-wrap gap-2">
                        {lv.theatersUrl && (
                          <a href={lv.theatersUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-600 underline">
                            劇場一覧 ↗
                          </a>
                        )}
                        {lv.purchaseUrl && (
                          <a href={lv.purchaseUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-600 underline">
                            チケット購入 ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {live.ppvInfo && live.ppvInfo.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <CardHead title="配信（PPV）情報" />
                <div className="space-y-3 p-3.5 text-sm text-gray-600">
                  {live.ppvInfo.map((p, i) => (
                    <div key={i}>
                      {p.platform && <p className="font-bold text-gray-800">{p.platform}</p>}
                      {p.viewingPeriod && <p>{p.viewingPeriod}</p>}
                      {p.price && <p>{p.price}</p>}
                      {p.info && <p className="whitespace-pre-wrap text-xs text-gray-500">{p.info}</p>}
                      {p.purchaseUrl && (
                        <a href={p.purchaseUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-600 underline">
                          視聴する ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== ライブレポート ===== */}
      {live.hasReport &&
        (live.reportLeadTitle ||
          live.reportContent ||
          live.officialReportUrl ||
          reportImages.length > 0) && (
          <section>
            <SectionHeading title="ライブレポート" />
            {live.officialReportUrl && (
              <a
                href={live.officialReportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-colors hover:bg-gray-50"
              >
                {live.reportThumbnail && (
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={live.reportThumbnail} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-gray-900">
                    {live.reportLeadTitle || "公式レポート"}
                  </span>
                  <span className="block text-[11px] text-gray-500">公式レポート ↗</span>
                </span>
              </a>
            )}
            {live.reportContent && (
              <div
                className="prose prose-sm mb-4 max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: live.reportContent }}
              />
            )}
            {reportImages.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                  フォトレポート
                </p>
                <ReportFlipBook images={reportImages} />
              </div>
            )}
          </section>
        )}
    </div>
  )
}

// ── サブコンポーネント ─────────────────────────────────────────────
function CardHead({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-gray-600">
      <span className="h-[7px] w-[7px] rounded-full bg-accent-600" />
      {title}
    </div>
  )
}

function LimitedBlock({ title, html }: { title: string; html: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">{title}</p>
      <div className="rte-content prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

/** "2026-07-27" → "07.27"（年は省略）。 */
function mdDot(dateStr?: string): string {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr ?? "")
  if (!m) return ""
  return `${m[2].padStart(2, "0")}.${m[3].padStart(2, "0")}`
}

function venueDateLabel(v: Venue): string {
  const dates = (v.shows ?? [])
    .map((s) => s.date)
    .filter((d): d is string => !!d)
    .sort()
  if (dates.length === 0) return ""
  return dates[0] === dates[dates.length - 1]
    ? mdDot(dates[0])
    : `${mdDot(dates[0])}〜${mdDot(dates[dates.length - 1])}`
}

function VenueBlock({
  venue,
  index,
  live,
  baseSetlist,
}: {
  venue: Venue
  index: number
  live: Awaited<ReturnType<typeof getLiveBySlug>>
  baseSetlist?: SetlistItem[]
}) {
  const color = VENUE_COLORS[index % VENUE_COLORS.length]
  const shows = [...(venue.shows ?? [])].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
  const goods = venue.venueGoods ?? []
  // この会場の公演ごとセトリ（showRef に会場名を含むもの）
  const showSetlists = (live?.showSetlists ?? []).filter(
    (s) =>
      s.showRef?.includes(venue.venueName) &&
      ((s.setlist && s.setlist.length > 0) || (s.note && s.note.trim().length > 0)),
  )

  return (
    <div id={`venue-${index}`} className="scroll-mt-20 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4">
        <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: color }} />
        <div className="min-w-0">
          <span className="text-base font-bold text-gray-900">{venue.venueName}</span>
          {venue.prefecture && <span className="ml-1 text-xs text-gray-500">{venue.prefecture}</span>}
        </div>
        {shows.length > 0 && (
          <span className="ml-auto text-xs font-semibold text-accent-600">{shows.length}公演</span>
        )}
      </div>

      {/* スケジュール表 */}
      {shows.length > 0 && (
        <div className="overflow-x-auto border-b border-gray-200">
          <table className="w-full text-center text-[13px]">
            <thead>
              <tr className="bg-accent-600 text-[11px] font-bold tracking-wide text-white">
                <th className="px-4 py-2.5">日程</th>
                <th className="px-4 py-2.5">部</th>
                <th className="px-4 py-2.5">スケジュール</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((s, j) => {
                const db = dayBadge(s.date)
                return (
                  <tr key={j} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-bold">
                      {s.date ? formatDateDot(s.date) : "—"}
                      {db && (
                        <span className={`ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${db.cls}`}>
                          {db.label}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-accent-700">{s.partLabel || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {s.scheduleText ? <ScheduleText text={s.scheduleText} /> : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* サブ情報グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* 会場MAP（会場MAP画像が登録されているときだけ表示） */}
        {venue.areaMapImage && (
          <div className="border-b border-gray-200 p-5 md:border-r">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">会場MAP</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={venue.areaMapImage}
              alt={`${venue.venueName} 会場MAP`}
              className="w-full rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* 物販情報 */}
        {goods.length > 0 && (
          <div className="border-b border-gray-200 p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">物販情報</p>
            <div className="space-y-3">
              {goods.map((g, j) => (
                <div key={j} className="rounded-lg border border-gray-200 p-3 text-[13px]">
                  {g.saleType && (
                    <span className="mb-2 inline-block rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700">
                      {g.saleType}
                    </span>
                  )}
                  <div className="space-y-1 text-gray-600">
                    {g.seirikenPeriod && <p>整理券 申込期間：{g.seirikenPeriod}</p>}
                    {g.lotteryResultDate && <p>当選発表日：{g.lotteryResultDate}</p>}
                    {g.saleLocation && <p className="whitespace-pre-wrap">販売場所：{g.saleLocation}</p>}
                    {g.saleTime && <p className="whitespace-pre-wrap">販売時間：{g.saleTime}</p>}
                    {g.note && <p className="whitespace-pre-wrap text-xs text-gray-500">{g.note}</p>}
                  </div>
                  {g.lotteryUrl && (
                    <a href={g.lotteryUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-accent-600 underline">
                      整理券申込 ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 会場限定グッズ/配布物 */}
        {venue.venueLimitedGoods && (
          <div className="border-b border-gray-200 p-5 md:col-span-2">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">この会場限定グッズ</p>
            <div className="rte-content prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: venue.venueLimitedGoods }} />
          </div>
        )}
        {venue.venueLimitedItems && (
          <div className="border-b border-gray-200 p-5 md:col-span-2">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">この会場限定配布物</p>
            <div className="rte-content prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: venue.venueLimitedItems }} />
          </div>
        )}

        {/* セットリスト（データがあるときだけ表示） */}
        {(showSetlists.length > 0 || (baseSetlist && baseSetlist.length > 0)) && (
          <div className="p-5 md:col-span-2">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">セットリスト</p>
            <SetlistSelector base={baseSetlist} showSetlists={showSetlists} variant="plain" />
          </div>
        )}
      </div>
    </div>
  )
}

function lineupName(t: TicketLineup): string {
  return t.ticketName ?? t.name ?? ""
}
function lineupTags(t: TicketLineup): string[] {
  return (t.tags ?? "")
    .split(/[/、,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
function isUpgradeTicket(t: TicketLineup): boolean {
  const name = lineupName(t)
  const note = t.note ?? ""
  const price = String(t.price ?? "").trim()
  return (
    /VIP|アップグレード|アプグレ|ハイタッチ/i.test(name) ||
    /アップグレード|アプグレ/.test(note) ||
    /^[+＋]/.test(price)
  )
}

/** チケット種別1行（VIP/アップグレードは強調＋特典タグ表示）。 */
function TicketLineupRow({ t }: { t: TicketLineup }) {
  const up = isUpgradeTicket(t)
  const tags = lineupTags(t)
  const name = lineupName(t)
  const isNum = typeof t.price === "number"
  const price = isNum ? `¥${(t.price as number).toLocaleString()}` : ((t.price as string) ?? "")
  const priceEl = price ? (
    <span
      className={`whitespace-nowrap text-base font-bold ${up ? "text-accent-700" : "text-gray-900"}`}
    >
      {price}
      {isNum && <span className="ml-0.5 text-[11px] font-normal text-gray-400">税込</span>}
    </span>
  ) : null
  const tagsEl =
    tags.length > 0 ? (
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="rounded bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700"
          >
            {tag}
          </span>
        ))}
      </div>
    ) : null

  // アップグレード券：説明を名前＋価格の下に全幅で表示。
  if (up) {
    return (
      <div className="my-1 rounded-lg bg-gradient-to-br from-accent-50 to-transparent px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-sm font-bold text-accent-700">{name}</p>
          {priceEl}
        </div>
        {t.note && <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">{t.note}</p>}
        {tagsEl}
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-800">{name}</p>
        {t.note && <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{t.note}</p>}
        {tagsEl}
      </div>
      {priceEl}
    </div>
  )
}

/** スケジュール文を「開場…/」と「開演…」で改行できるよう、各部を nowrap 単位に分割。 */
function ScheduleText({ text }: { text: string }) {
  const idx = text.indexOf("開演")
  if (idx <= 0) return <>{text}</>
  const open = text.slice(0, idx).replace(/\s+$/, "")
  const start = text.slice(idx)
  return (
    <>
      <span className="whitespace-nowrap">{open}</span>{" "}
      <span className="whitespace-nowrap">{start}</span>
    </>
  )
}

function statusBadgeCls(s?: string): string {
  if (s === "受付中") return "bg-green-100 text-green-700 border border-green-200 animate-pulse"
  if (s === "受付前") return "bg-slate-100 text-slate-600 border border-slate-200"
  return "bg-gray-100 text-gray-400 border border-gray-200"
}

function SalesOutlets({
  outlets,
  isClosed,
}: {
  outlets?: TicketSalesOutlet[]
  isClosed?: boolean
}) {
  const list = (outlets ?? []).filter(
    (o) => o.name || o.url || (o.showRefs?.length ?? 0) > 0 || (o.ticketScopes?.length ?? 0) > 0,
  )
  if (list.length === 0) return null
  return (
    <div className="mt-3 flex flex-col gap-2">
      {list.map((o, i) => {
        const scopes = (o.ticketScopes ?? []).filter((s) => s.ticketLineupRef || (s.showRefs?.length ?? 0) > 0)
        return (
          <div key={i} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-gray-800">{outletDisplayName(o.name)}</span>
              {o.url && !isClosed && (
                <a
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-accent-600 px-2.5 py-1 text-[11px] font-bold text-white"
                >
                  申込 ↗
                </a>
              )}
            </div>
            {scopes.length > 0 ? (
              <div className="space-y-0.5 text-[11px] text-gray-600">
                {scopes.map((s, j) => (
                  <p key={j}>
                    {s.ticketLineupRef && <span className="font-bold text-gray-800">{s.ticketLineupRef}</span>}
                    {s.showRefs && s.showRefs.length > 0 && <span>：{s.showRefs.join("、")}</span>}
                  </p>
                ))}
              </div>
            ) : (
              o.showRefs && o.showRefs.length > 0 && (
                <p className="text-[11px] text-gray-500">対象公演：{o.showRefs.join("、")}</p>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}

function TicketScheduleItem({ ticket }: { ticket: TicketInfo }) {
  // 取込データの別キー（sale_start / saleType / name / note）にも対応。
  const ticketType = ticket.ticketType || ticket.name || ""
  const method = ticket.method ?? ticket.saleType
  const saleStart = ticket.saleStart ?? ticket.sale_start
  const saleEnd = ticket.saleEnd ?? ticket.sale_end
  const info = ticket.info ?? ticket.note
  const status = getTicketStatus(saleStart, saleEnd, ticket.salePeriod)
  const isClosed = status === "受付終了"
  const venueDates = (ticket.venueDates ?? []).filter(
    (vd) => vd.venueName || vd.date || vd.salePeriod || (vd.showRefs?.length ?? 0) > 0,
  )
  const hasBody =
    !!ticket.salePeriod ||
    !!ticket.price ||
    (ticket.ticketLineupRefs?.length ?? 0) > 0 ||
    !!info ||
    (ticket.salesOutlets?.length ?? 0) > 0 ||
    venueDates.length > 0

  return (
    // 受付終了は帯を閉じる（open=false）。受付中/受付前は開いた状態。
    <details
      open={!isClosed}
      className={`group overflow-hidden rounded-lg border ${
        status === "受付中"
          ? "border-green-200 bg-green-50/30"
          : isClosed
            ? "border-gray-200 bg-gray-100/70"
            : "border-gray-200 bg-gray-50"
      }`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={`text-[13px] font-bold ${isClosed ? "text-gray-500" : "text-gray-800"}`}>
            {ticketType}
          </span>
          {method && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
              {method}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {status && (
            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeCls(status)}`}>
              {status}
            </span>
          )}
          {hasBody && (
            <span className="text-[10px] text-gray-400 transition-transform group-open:rotate-180">▼</span>
          )}
        </div>
      </summary>

      {hasBody && (
        <div className="border-t border-gray-200 px-3 pb-3 pt-2.5">
          {ticket.salePeriod && <p className="text-[11px] text-gray-500">{ticket.salePeriod}</p>}
          {ticket.price && <p className="text-[11px] text-gray-500">{ticket.price}</p>}
          {ticket.ticketLineupRefs && ticket.ticketLineupRefs.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {ticket.ticketLineupRefs.map((r, i) => (
                <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {r}
                </span>
              ))}
            </div>
          )}
          {info && <p className="mt-1 whitespace-pre-wrap text-[11px] text-gray-500">{info}</p>}

          <SalesOutlets outlets={ticket.salesOutlets} isClosed={isClosed} />

          {venueDates.length > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-2.5">
              <p className="mb-2 text-[11px] font-bold tracking-wide text-gray-500">会場・日付ごとの受付期間</p>
              <div className="flex flex-col gap-1.5">
                {venueDates.map((vd, j) => (
                  <div key={j} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px]">
                    <p className="font-bold text-gray-800">
                      {vd.venueName}
                      {vd.date && <span className="ml-1 font-normal text-gray-500">{formatDateDot(vd.date)}</span>}
                    </p>
                    {vd.salePeriod && <p className="text-gray-500">{vd.salePeriod}</p>}
                    {vd.showRefs && vd.showRefs.length > 0 && (
                      <p className="mt-0.5 text-gray-500">{vd.showRefs.join("・")}</p>
                    )}
                    <SalesOutlets outlets={vd.salesOutlets} isClosed={isClosed} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </details>
  )
}
