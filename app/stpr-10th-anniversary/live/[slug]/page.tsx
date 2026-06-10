import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getLiveStatus,
  formatPeriod,
  formatDateDot,
  getDaysUntil,
  venuesSummary,
} from "@/lib/utils"
import { getLiveBySlug } from "@/lib/repo"
import type {
  Venue,
  Show,
  TicketInfo,
  LiveGoodsInfo,
} from "@/data/lives"
import SafeImage from "@/components/common/SafeImage"
import StatusBadge from "@/components/common/StatusBadge"
import ImageGallery from "@/components/common/ImageGallery"
import EventSection from "@/components/event/EventSection"
import ShareButton from "@/components/common/ShareButton"
import GoogleCalendarButton from "@/components/common/GoogleCalendarButton"
import VenueMap from "@/components/common/VenueMap"
import { SITE_URL } from "@/lib/site"

const BASE = "/stpr-10th-anniversary"

function looksLikeHtml(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s)
}

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const live = await getLiveBySlug(slug)
  if (!live) return { title: "ライブが見つかりません" }
  const description = live.description?.slice(0, 100) || `${live.title}のライブ情報`
  const images = live.keyVisual ? [live.keyVisual] : []
  return {
    title: live.title,
    description,
    openGraph: { title: live.title, description, images },
    twitter: { card: "summary_large_image", title: live.title, description, images },
  }
}

const SECTION = "rounded-2xl border border-gold-200/70 bg-white/55 p-4 backdrop-blur-sm shadow-sm md:p-6 mb-6"
const SECTION_H2 = "mb-4 flex items-center gap-2 font-serif font-bold text-[#3a2540]"
const BLOCK = "rounded-xl border border-gold-100/70 p-4"
const BTN = "inline-block rounded-xl bg-gold-400 px-4 py-2 text-xs text-white transition-colors hover:bg-gold-500"

export default async function LiveDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const live = await getLiveBySlug(slug)
  if (!live) notFound()

  const status = live.periodStart
    ? getLiveStatus(live.periodStart, live.periodEnd)
    : live.status
  const daysUntil = getDaysUntil(live.periodStart)
  const shareUrl = `${SITE_URL}${BASE}/live/${live.slug}`
  const shareText = `【すとぷり10周年】${live.title} に参加しました！ #すとぷり #すとぷり10周年 ${shareUrl}`
  const hasBaseSetlist = !!(live.setlist && live.setlist.length > 0)
  const venueSetlistNotes = live.venues.filter(
    (v) => v.setlistNotes && v.setlistNotes.trim().length > 0,
  )

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* パンくず */}
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#9a8aa0]">
        <Link href={`${BASE}/live`} className="transition-colors hover:text-gold-600">
          LIVE
        </Link>
        <span className="text-gold-200">›</span>
        <span className="font-medium text-[#3a2540]">{live.title}</span>
      </nav>

      {/* HERO：キービジュアル・ステータス・タイトル・日程・会場・説明 */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm">
        {live.keyVisual && (
          <div className="relative aspect-[16/9] w-full">
            <SafeImage
              src={live.keyVisual}
              alt={live.title}
              fill
              fallbackLabel="LIVE"
              className="object-cover"
              sizes="(min-width: 768px) 1152px, 100vw"
              priority
            />
          </div>
        )}
        <div className="p-4 md:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {live.liveType && (
              <span className="rounded-full bg-gold-400/95 px-3 py-1 text-xs font-bold text-white">
                {live.liveType}
              </span>
            )}
            {live.is10th && (
              <span className="rounded-full bg-rose-400/90 px-3 py-1 text-xs font-bold text-white">
                10TH
              </span>
            )}
            <StatusBadge status={status} />
          </div>
          <h1 className="mb-2 font-serif text-xl font-bold text-[#3a2540] md:text-3xl">
            {live.title}
          </h1>
          <div className="mb-3 flex flex-wrap gap-3 text-sm text-[#6a5570]">
            <span>{formatPeriod(live.periodStart, live.periodEnd)}</span>
            {live.venues.length > 0 && <span>{live.venues.length}会場</span>}
          </div>
          {live.hashtag && (
            <a
              href={`https://x.com/hashtag/${encodeURIComponent(live.hashtag.replace(/^#/, ""))}?src=hashtag_click`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 inline-flex items-center rounded-full bg-gold-50 px-3 py-1.5 text-sm text-gold-700 transition-colors hover:bg-gold-100"
            >
              {live.hashtag.startsWith("#") ? live.hashtag : `#${live.hashtag}`}
            </a>
          )}
          {live.venues.length > 0 && (
            <p className="mb-3 text-sm text-[#9a8aa0]">{venuesSummary(live.venues)}</p>
          )}
          {live.description && (
            <p className="whitespace-pre-wrap text-sm text-[#6a5570]">{live.description}</p>
          )}
        </div>
      </div>

      {/* シェア・カレンダー追加 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <ShareButton text={shareText} />
        <GoogleCalendarButton
          title={live.title}
          start={live.periodStart}
          end={live.periodEnd}
          details={shareUrl}
          location={live.venues.length > 0 ? venuesSummary(live.venues) : undefined}
        />
      </div>

      {/* カウントダウン */}
      {status === "coming" && daysUntil !== null && daysUntil >= 0 && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-gold-100 to-rose-100 p-6 text-center">
          <p className="mb-1 font-display text-xs font-bold tracking-widest text-gold-700">
            COUNTDOWN
          </p>
          <p className="mb-2 text-sm text-[#6a5570]">開催まであと</p>
          <p className="font-serif text-5xl font-bold text-gold-600 md:text-6xl">
            {daysUntil}
            <span className="ml-1 text-2xl">日</span>
          </p>
        </div>
      )}
      {status === "ongoing" && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-100 to-gold-100 p-6 text-center">
          <p className="font-serif text-3xl font-bold text-gold-600 md:text-4xl">開催中！</p>
        </div>
      )}

      {/* 公式リンク */}
      {(live.officialSiteUrl ||
        live.officialPlaylistUrl ||
        live.officialReportUrl ||
        live.unofficialReportUrl) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {live.officialSiteUrl && (
            <a href={live.officialSiteUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
              公式サイト
            </a>
          )}
          {live.officialPlaylistUrl && (
            <a href={live.officialPlaylistUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
              公式プレイリスト
            </a>
          )}
          {live.officialReportUrl && (
            <a href={live.officialReportUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
              公式レポート
            </a>
          )}
          {live.unofficialReportUrl && (
            <a href={live.unofficialReportUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
              非公式レポート
            </a>
          )}
        </div>
      )}

      {/* チケット情報（種別と価格）: アコーディオン・新しい順（逆順） */}
      {live.ticketLineup && live.ticketLineup.length > 0 && (
        <EventSection title="チケット情報">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[...live.ticketLineup].reverse().map((t, i) => (
              <div key={i} className={`${BLOCK} flex items-center justify-between`}>
                <span className="font-bold text-[#3a2540]">{t.ticketName}</span>
                <span className="font-bold text-gold-700">{t.price}</span>
              </div>
            ))}
          </div>
        </EventSection>
      )}

      {/* TICKETスケジュール: アコーディオン・新しい順（逆順） */}
      {live.ticketInfo && live.ticketInfo.length > 0 && (
        <EventSection title="TICKETスケジュール">
          <div className="space-y-3">
            {[...live.ticketInfo].reverse().map((t, i) => (
              <TicketBlock key={i} ticket={t} />
            ))}
          </div>
        </EventSection>
      )}

      {/* ライブビューイング */}
      {live.liveViewing && live.liveViewing.length > 0 && (
        <section className={SECTION}>
          <h2 className={SECTION_H2}>ライブビューイング</h2>
          <div className="space-y-3">
            {live.liveViewing.map((lv, i) => (
              <div key={i} className={BLOCK}>
                <h3 className="mb-2 font-bold text-gold-700">{lv.title}</h3>
                <div className="space-y-1 text-sm text-[#6a5570]">
                  {lv.screeningDate && <p>{lv.screeningDate}</p>}
                  {lv.price && <p>{lv.price}</p>}
                  {lv.info && (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-[#9a8aa0]">{lv.info}</p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lv.theatersUrl && (
                    <a href={lv.theatersUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
                      劇場一覧 →
                    </a>
                  )}
                  {lv.purchaseUrl && (
                    <a href={lv.purchaseUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
                      チケット購入 →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PPV配信 */}
      {live.ppvInfo && live.ppvInfo.length > 0 && (
        <section className={SECTION}>
          <h2 className={SECTION_H2}>PPV配信</h2>
          <div className="space-y-3">
            {live.ppvInfo.map((ppv, i) => (
              <div key={i} className={BLOCK}>
                <h3 className="mb-2 font-bold text-gold-700">{ppv.platform}</h3>
                <div className="space-y-1 text-sm text-[#6a5570]">
                  {ppv.viewingPeriod && <p>{ppv.viewingPeriod}</p>}
                  {ppv.price && <p>{ppv.price}</p>}
                  {ppv.info && (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-[#9a8aa0]">{ppv.info}</p>
                  )}
                </div>
                {ppv.purchaseUrl && (
                  <a
                    href={ppv.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-3 ${BTN}`}
                  >
                    視聴する →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* グッズ情報（ツアー全体） */}
      {live.goodsInfo && live.goodsInfo.length > 0 && (
        <section className={SECTION}>
          <h2 className={SECTION_H2}>グッズ情報（ツアー全体）</h2>
          <div className="space-y-3">
            {live.goodsInfo.map((g, i) => (
              <LiveGoodsBlock key={i} goods={g} />
            ))}
          </div>
        </section>
      )}

      {/* ライブグッズ（複数画像・ライトボックス） */}
      {live.goodsImages && live.goodsImages.length > 0 && (
        <section className={SECTION}>
          <h2 className={SECTION_H2}>ライブグッズ</h2>
          <ImageGallery images={live.goodsImages} />
        </section>
      )}

      {/* FC情報 */}
      {live.fcInfo && live.fcInfo.length > 0 && (
        <section className={SECTION}>
          <h2 className={SECTION_H2}>FC関連情報</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {live.fcInfo.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`FC情報${i + 1}`} className="w-full rounded-xl" />
            ))}
          </div>
        </section>
      )}

      {/* アプグレグッズ */}
      {live.upgradeGoodsInfo && live.upgradeGoodsInfo.length > 0 && (
        <section className={SECTION}>
          <h2 className={SECTION_H2}>アプグレグッズ情報</h2>
          <div className="space-y-4">
            {live.upgradeGoodsInfo.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`アプグレ${i + 1}`} className="w-full rounded-xl" />
            ))}
          </div>
        </section>
      )}

      {/* 会場スケジュール（SCHEDULE & STAGE）: アコーディオン */}
      {live.venues.length > 0 && (
        <EventSection title="SCHEDULE & STAGE" count={live.venues.length}>
          <div className="space-y-6">
            {live.venues.map((v, i) => (
              <VenueBlock key={i} venue={v} />
            ))}
          </div>
        </EventSection>
      )}

      {/* セットリスト（基本セトリ + 各会場の変更メモ）: アコーディオン */}
      {(hasBaseSetlist || venueSetlistNotes.length > 0) && (
        <EventSection title="セトリ">
          {hasBaseSetlist && (
            <>
              <p className="mb-2 text-xs font-bold text-[#9a8aa0]">基本セットリスト</p>
              <ol className="rounded-xl bg-gold-50/40 p-2">
                {[...live.setlist!]
                  .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
                  .map((s, i) => (
                    <li key={i} className="flex items-center gap-3 rounded p-1.5">
                      <span className="w-8 shrink-0 text-right text-xs text-[#9a8aa0]">
                        {s.trackNumber != null ? String(s.trackNumber).padStart(2, "0") : "－"}
                      </span>
                      <span className="flex-1 text-sm text-[#3a2540]">{s.title || "?"}</span>
                      {s.memo && <span className="text-xs text-[#9a8aa0]">{s.memo}</span>}
                    </li>
                  ))}
              </ol>
            </>
          )}
          {venueSetlistNotes.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold text-[#9a8aa0]">会場ごとの変更メモ</p>
              {venueSetlistNotes.map((v, i) => (
                <div key={i} className={BLOCK}>
                  <h4 className="mb-1 text-sm font-bold text-gold-700">{v.venueName}</h4>
                  <p className="whitespace-pre-wrap text-sm text-[#6a5570]">{v.setlistNotes}</p>
                </div>
              ))}
            </div>
          )}
        </EventSection>
      )}
    </div>
  )
}

// ====== サブコンポーネント ======

function TicketBlock({ ticket }: { ticket: TicketInfo }) {
  const isClosed = ticket.status === "受付終了"
  const isLottery = ticket.method?.includes("抽選")
  const venueDates = (ticket.venueDates ?? []).filter(
    (vd) => vd.venueName || vd.date || vd.saleStart || vd.saleEnd,
  )
  return (
    <div className="rounded-xl border border-gold-100/70 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-gold-700">{ticket.ticketType}</h3>
          {ticket.status && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                ticket.status === "受付中"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {ticket.status}
            </span>
          )}
        </div>
        {ticket.method && (
          <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs text-[#6a5570]">
            {ticket.method}
          </span>
        )}
      </div>
      <div className="space-y-1 text-sm text-[#6a5570]">
        {ticket.ticketLineupRefs && ticket.ticketLineupRefs.length > 0 && (
          <p>
            <span className="text-[#9a8aa0]">対象チケット：</span>
            {ticket.ticketLineupRefs.join("、")}
          </p>
        )}
        {ticket.salePeriod && <p>{ticket.salePeriod}</p>}
        {ticket.price && <p>{ticket.price}</p>}
        {ticket.info && (
          <p className="mt-2 whitespace-pre-wrap text-xs text-[#9a8aa0]">{ticket.info}</p>
        )}
      </div>
      {venueDates.length > 0 && (
        <details className="group mt-3 border-t border-gold-100/70 pt-2">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold text-gold-700">
            <span>会場・日付ごとの受付期間</span>
            <span className="text-gold-500 transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="mt-2 space-y-2">
            {venueDates.map((vd, j) => (
              <div key={j} className="rounded-lg bg-gold-50/60 p-2.5 text-xs text-[#6a5570]">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  {vd.venueName && (
                    <span className="font-bold text-[#3a2540]">{vd.venueName}</span>
                  )}
                  {vd.date && (
                    <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[11px] text-white">
                      {formatDateDot(vd.date)}
                    </span>
                  )}
                </div>
                {(vd.saleStart || vd.saleEnd) && (
                  <p>
                    <span className="text-[#9a8aa0]">受付：</span>
                    {vd.saleStart ?? ""}
                    {vd.saleEnd ? ` 〜 ${vd.saleEnd}` : vd.saleStart ? " 〜" : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
      {ticket.purchaseUrl && !isClosed && (
        <a
          href={ticket.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-xl bg-gold-400 px-4 py-2 text-xs text-white transition-colors hover:bg-gold-500"
        >
          {isLottery ? "応募する →" : "購入する →"}
        </a>
      )}
    </div>
  )
}

function LiveGoodsBlock({ goods }: { goods: LiveGoodsInfo }) {
  // image は単一URL（旧データ）/ URL配列（複数）の両対応。
  const images = Array.isArray(goods.image)
    ? goods.image.filter((s) => typeof s === "string" && s.length > 0)
    : goods.image
      ? [goods.image]
      : []
  return (
    <div className="rounded-xl border border-gold-100/70 p-4">
      <h3 className="mb-3 font-bold text-gold-700">{goods.saleType}</h3>
      {images.length > 0 && (
        <div className="mb-3">
          <ImageGallery images={images} />
        </div>
      )}
      <div className="space-y-1 text-sm text-[#6a5570]">
        {goods.salePeriod && <p>{goods.salePeriod}</p>}
        {goods.deliveryInfo && <p>{goods.deliveryInfo}</p>}
        {goods.purchaseBonus && (
          <p>
            <span className="text-[#9a8aa0]">購入特典：</span>
            {goods.purchaseBonus}
          </p>
        )}
        {goods.paymentMethod && (
          <p>
            <span className="text-[#9a8aa0]">お支払い方法：</span>
            {goods.paymentMethod}
          </p>
        )}
        {goods.venueProducts && (
          <div className="mt-2">
            <p className="mb-1 text-[#9a8aa0]">会場販売商品</p>
            {looksLikeHtml(goods.venueProducts) ? (
              <div
                className="rte-content text-[#3a2540]"
                dangerouslySetInnerHTML={{ __html: goods.venueProducts }}
              />
            ) : (
              <p className="whitespace-pre-wrap">{goods.venueProducts}</p>
            )}
          </div>
        )}
        {goods.info && (
          <p className="mt-2 whitespace-pre-wrap text-xs text-[#9a8aa0]">{goods.info}</p>
        )}
      </div>
      {goods.purchaseUrl && (
        <a
          href={goods.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-xl bg-gold-400 px-4 py-2 text-xs text-white transition-colors hover:bg-gold-500"
        >
          購入ページ →
        </a>
      )}
    </div>
  )
}

function VenueBlock({ venue }: { venue: Venue }) {
  return (
    <details open className="group overflow-hidden rounded-xl border-2 border-gold-100">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-gold-50 md:p-6">
        <div>
          <h3 className="mb-1 text-lg font-bold text-gold-700">{venue.venueName}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-[#6a5570]">
            {venue.stageName && <span>{venue.stageName}</span>}
            {venue.prefecture && (
              <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs">{venue.prefecture}</span>
            )}
          </div>
        </div>
        <span className="text-xl text-gold-600 transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="border-t border-gold-100 p-4 pt-0 md:p-6">
        {venue.shows && venue.shows.length > 0 && (
          <div className="mb-6 mt-4">
            <p className="mb-3 text-xs font-bold text-[#9a8aa0]">SCHEDULE</p>
            <div className="space-y-4">
              {[...venue.shows]
                .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
                .map((show, i) => (
                  <ShowBlock key={i} show={show} />
                ))}
            </div>
          </div>
        )}
        {venue.venueGoods && venue.venueGoods.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-xs font-bold text-[#9a8aa0]">GOODS / 会場物販状況</p>
            <div className="space-y-3">
              {venue.venueGoods.map((vg, i) => (
                <div key={i} className="rounded-lg border border-gold-100/70 p-3">
                  <div className="space-y-1 text-sm text-[#6a5570]">
                    {vg.saleTime && (
                      <p>
                        <span className="text-[#9a8aa0]">販売時間：</span>
                        <span className="whitespace-pre-wrap">{vg.saleTime}</span>
                      </p>
                    )}
                    {vg.saleLocation && (
                      <p>
                        <span className="text-[#9a8aa0]">販売場所：</span>
                        <span className="whitespace-pre-wrap">{vg.saleLocation}</span>
                      </p>
                    )}
                    {vg.ticketPeriod && (
                      <p>
                        <span className="text-[#9a8aa0]">整理券の受付期間：</span>
                        <span className="whitespace-pre-wrap">{vg.ticketPeriod}</span>
                      </p>
                    )}
                    {vg.lotteryResult && (
                      <p>
                        <span className="text-[#9a8aa0]">抽選結果発表：</span>
                        <span className="whitespace-pre-wrap">{vg.lotteryResult}</span>
                      </p>
                    )}
                    {vg.ticketRequiredTime && (
                      <p>
                        <span className="text-[#9a8aa0]">整理券が必要な時間：</span>
                        <span className="whitespace-pre-wrap">{vg.ticketRequiredTime}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {venue.areaMapImage && (
          <div className="mb-2">
            <p className="mb-3 text-xs font-bold text-[#9a8aa0]">AREA MAP</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={venue.areaMapImage} alt="会場MAP" className="w-full rounded-lg" />
          </div>
        )}
        {/* 会場の地図（Google Maps 埋め込み） */}
        {venue.venueName && (
          <div className="mt-4">
            <p className="mb-3 text-xs font-bold text-[#9a8aa0]">MAP / 会場の地図</p>
            <VenueMap query={venue.venueName} title={`${venue.venueName} の地図`} />
          </div>
        )}
      </div>
    </details>
  )
}

function ShowBlock({ show }: { show: Show }) {
  return (
    <div className="rounded-lg bg-gold-50/60 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {show.date && (
          <span className="font-bold text-[#3a2540]">{formatDateDot(show.date)}</span>
        )}
        {show.partLabel && (
          <span className="rounded-full bg-gold-400 px-2 py-0.5 text-xs text-white">
            {show.partLabel}
          </span>
        )}
        {show.scheduleText && <span className="text-xs text-[#6a5570]">{show.scheduleText}</span>}
      </div>
      {show.setlist && show.setlist.length > 0 && (
        <div>
          <p className="mb-2 mt-3 text-xs text-[#9a8aa0]">SETLIST</p>
          <div className="space-y-1 rounded-lg bg-white/70 p-2">
            {[...show.setlist]
              .sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0))
              .map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded p-1">
                  <span className="w-8 shrink-0 text-right text-xs text-[#9a8aa0]">
                    {item.trackNumber != null
                      ? String(item.trackNumber).padStart(2, "0")
                      : "－"}
                  </span>
                  <span className="flex-1 text-sm text-[#3a2540]">{item.title || "?"}</span>
                  {item.memo && <span className="text-xs text-[#9a8aa0]">{item.memo}</span>}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
