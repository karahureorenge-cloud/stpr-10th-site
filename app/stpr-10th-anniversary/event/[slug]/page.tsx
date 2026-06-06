import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getLiveStatus,
  formatPeriod,
  getDaysUntil,
  resolveYoutubeThumbnail,
} from "@/lib/utils"
import { getEventBySlug } from "@/lib/repo"
import type {
  EventStore,
  EventBroadcast,
  EventPost,
  EventCampaign,
  EventMedia,
  EventEpisode,
} from "@/data/events"
import SafeImage from "@/components/common/SafeImage"
import EventSection from "@/components/event/EventSection"
import EventItemGrid, { type EventGridItem } from "@/components/event/EventItemGrid"
import ShareButton from "@/components/common/ShareButton"
import GoogleCalendarButton from "@/components/common/GoogleCalendarButton"
import { SITE_URL } from "@/lib/site"

const BASE = "/stpr-10th-anniversary"

/** HTML タグを含むか（リッチテキスト保存値か、旧来のプレーンテキストか判定）。 */
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
  const event = await getEventBySlug(slug)
  if (!event) return { title: "イベントが見つかりません" }
  const description = event.description?.slice(0, 100) || `${event.title}のイベント情報`
  const images = event.keyVisual ? [event.keyVisual] : []
  return {
    title: event.title,
    description,
    openGraph: { title: event.title, description, images },
    twitter: { card: "summary_large_image", title: event.title, description, images },
  }
}

const BLOCK = "rounded-xl border border-gold-100/70 p-4"
const BTN = "inline-block rounded-xl bg-gold-400 px-4 py-2 text-xs text-white transition-colors hover:bg-gold-500"

// 開催中フラグ込みのステータス。
function eventState(event: { isOngoing?: boolean; periodStart?: string; periodEnd?: string }) {
  if (event.isOngoing) return "ongoing" as const
  if (!event.periodStart) return "coming" as const
  return getLiveStatus(event.periodStart, event.periodEnd)
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const state = eventState(event)
  const daysUntil = getDaysUntil(event.periodStart)
  const shareUrl = `${SITE_URL}${BASE}/event/${event.slug}`
  const shareText = `【すとぷり10周年】${event.title} に参加しました！ #すとぷり #すとぷり10周年 ${shareUrl}`

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* パンくず */}
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#9a8aa0]">
        <Link href={`${BASE}/event`} className="transition-colors hover:text-gold-600">
          EVENT
        </Link>
        <span className="text-gold-200">›</span>
        <span className="font-medium text-[#3a2540]">{event.title}</span>
      </nav>

      {/* HERO：キービジュアル・ステータス・タイトル・期間・説明 */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gold-200/70 bg-white/55 backdrop-blur-sm">
        {event.keyVisual && (
          <div className="relative aspect-[16/9] w-full bg-gold-50/40">
            <SafeImage
              src={event.keyVisual}
              alt={event.title}
              fill
              fallbackLabel="EVENT"
              className="object-contain"
              sizes="(min-width: 768px) 1152px, 100vw"
              priority
            />
          </div>
        )}
        <div className="p-4 md:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {event.eventType && (
              <span className="rounded-full bg-gold-400/95 px-3 py-1 text-xs font-bold text-white">
                {event.eventType}
              </span>
            )}
            {state === "coming" && (
              <span className="rounded-full bg-slate-500 px-3 py-1 text-xs font-bold text-white">
                開催予定
              </span>
            )}
            {state === "ongoing" && (
              <span className="animate-pulse rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                ● 開催中
              </span>
            )}
            {state === "finished" && (
              <span className="rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white">
                終了
              </span>
            )}
          </div>
          <h1 className="mb-2 font-serif text-xl font-bold text-[#3a2540] md:text-3xl">
            {event.title}
          </h1>
          {event.collabPartner && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2">
              <span className="font-display text-[11px] tracking-[0.2em] text-rose-400">
                COLLABORATION
              </span>
              <span className="font-serif text-base font-bold text-[#3a2540] md:text-lg">
                ✕ {event.collabPartner}
              </span>
            </div>
          )}
          <div className="mb-3 flex flex-wrap gap-3 text-sm text-[#6a5570]">
            <span>
              {formatPeriod(event.periodStart, event.periodEnd)}
              {event.isOngoing && !event.periodEnd && " ～ 継続中"}
            </span>
          </div>
          {event.hashtag && (
            <a
              href={`https://x.com/hashtag/${encodeURIComponent(event.hashtag.replace(/^#/, ""))}?src=hashtag_click`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 inline-flex items-center rounded-full bg-gold-50 px-3 py-1.5 text-sm text-gold-700 transition-colors hover:bg-gold-100"
            >
              {event.hashtag.startsWith("#") ? event.hashtag : `#${event.hashtag}`}
            </a>
          )}
          {event.description && (
            <p className="whitespace-pre-wrap text-sm text-[#6a5570]">{event.description}</p>
          )}
        </div>
      </div>

      {/* シェア・カレンダー追加 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <ShareButton text={shareText} />
        <GoogleCalendarButton
          title={event.title}
          start={event.periodStart}
          end={event.periodEnd}
          details={shareUrl}
        />
      </div>

      {/* カウントダウン */}
      {state === "coming" && daysUntil !== null && daysUntil >= 0 && (
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

      {/* 公式リンク */}
      {event.url && (
        <div className="mb-6 flex flex-wrap gap-2">
          <a href={event.url} target="_blank" rel="noopener noreferrer" className={BTN}>
            公式サイト
          </a>
        </div>
      )}

      {/* 1. 店舗情報 */}
      {event.storeInfo && event.storeInfo.length > 0 && (
        <EventSection title="店舗情報" count={event.storeInfo.length}>
          <div className="space-y-4">
            {event.storeInfo.map((s, i) => (
              <StoreBlock key={i} store={s} />
            ))}
          </div>
        </EventSection>
      )}

      {/* 2. メニュー・特典（グリッド + モーダル拡大） */}
      {event.menuInfo && event.menuInfo.length > 0 && (
        <EventSection title="メニュー・特典" count={event.menuInfo.length}>
          <EventItemGrid
            items={event.menuInfo.map(
              (m): EventGridItem => ({
                title: m.menuName,
                images: toImageList(m.image),
                description: m.description,
                info: m.info,
              }),
            )}
          />
        </EventSection>
      )}

      {/* 3. グッズ販売（グリッド + モーダル拡大） */}
      {event.goodsInfo && event.goodsInfo.length > 0 && (
        <EventSection title="グッズ販売" count={event.goodsInfo.length}>
          <EventItemGrid
            items={event.goodsInfo.map(
              (g): EventGridItem => ({
                title: g.goodsName,
                images: toImageList(g.image),
                meta: g.salePeriod ? [g.salePeriod] : undefined,
                info: g.info,
                linkUrl: g.purchaseUrl,
                linkLabel: "購入ページ",
              }),
            )}
          />
        </EventSection>
      )}

      {/* 4. 配信情報 */}
      {event.broadcastInfo && event.broadcastInfo.length > 0 && (
        <EventSection title="配信情報" count={event.broadcastInfo.length}>
          <div className="space-y-2">
            {event.broadcastInfo.map((b, i) => (
              <BroadcastBlock key={i} broadcast={b} />
            ))}
          </div>
        </EventSection>
      )}

      {/* 5. 投稿スケジュール */}
      {event.postSchedule && event.postSchedule.length > 0 && (
        <EventSection title="投稿スケジュール" count={event.postSchedule.length}>
          <div className="space-y-2">
            {event.postSchedule.map((p, i) => (
              <PostBlock key={i} post={p} />
            ))}
          </div>
        </EventSection>
      )}

      {/* 6. キャンペーン */}
      {event.campaignInfo && event.campaignInfo.length > 0 && (
        <EventSection title="キャンペーン" count={event.campaignInfo.length}>
          <div className="space-y-3">
            {event.campaignInfo.map((c, i) => (
              <CampaignBlock key={i} campaign={c} />
            ))}
          </div>
        </EventSection>
      )}

      {/* 7. メディア出演 */}
      {event.mediaInfo && event.mediaInfo.length > 0 && (
        <EventSection title="メディア出演" count={event.mediaInfo.length}>
          <div className="space-y-3">
            {event.mediaInfo.map((m, i) => (
              <MediaBlock key={i} media={m} />
            ))}
          </div>
        </EventSection>
      )}

      {/* 8. エピソード */}
      {event.episodes && event.episodes.length > 0 && (
        <EventSection title="エピソード" count={event.episodes.length}>
          <div className="space-y-3">
            {[...event.episodes]
              .sort((a, b) => (b.episodeNumber ?? 0) - (a.episodeNumber ?? 0))
              .map((ep, i) => (
                <EpisodeBlock key={i} episode={ep} />
              ))}
          </div>
        </EventSection>
      )}

      {/* 9. 大会・コンテスト（セクションごとにアコーディオン） */}
      {event.tournamentInfo &&
        event.tournamentInfo.length > 0 &&
        event.tournamentInfo.map((t, i) => (
          <EventSection key={i} title={t.sectionTitle || "大会・コンテスト"}>
            {toImageList(t.image).map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={idx} src={src} alt={t.sectionTitle ?? ""} className="mb-3 w-full rounded-xl" />
            ))}
            {t.content && (
              <p className="whitespace-pre-wrap text-sm text-[#6a5570]">{t.content}</p>
            )}
          </EventSection>
        ))}

      {/* 10. カスタムセクション（セクションごとにアコーディオン） */}
      {event.customSection &&
        event.customSection.length > 0 &&
        event.customSection.map((c, i) => (
          <EventSection key={i} title={c.sectionTitle || "セクション"}>
            {toImageList(c.image).map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={idx} src={src} alt={c.sectionTitle ?? ""} className="mb-3 w-full rounded-xl" />
            ))}
            {c.content &&
              (looksLikeHtml(c.content) ? (
                <div
                  className="rte-content text-[#3a2540]"
                  dangerouslySetInnerHTML={{ __html: c.content }}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-[#6a5570]">{c.content}</p>
              ))}
          </EventSection>
        ))}
    </div>
  )
}

// ====== サブコンポーネント ======

/** 画像値（単一URL文字列 or URL配列）を配列に正規化する。 */
function toImageList(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string" && x.length > 0)
  }
  if (typeof v === "string" && v.length > 0) return [v]
  return []
}

function StoreBlock({ store }: { store: EventStore }) {
  return (
    <div className={BLOCK}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {store.storeName && <h3 className="font-bold text-gold-700">{store.storeName}</h3>}
        {store.storeType && (
          <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-700">
            {store.storeType}
          </span>
        )}
        {store.prefecture && (
          <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs text-[#6a5570]">
            {store.prefecture}
          </span>
        )}
      </div>
      <div className="space-y-1 text-sm text-[#6a5570]">
        {store.address && <p>{store.address}</p>}
        {store.periodText && <p>{store.periodText}</p>}
        {store.info && <p className="mt-2 whitespace-pre-wrap text-xs text-[#9a8aa0]">{store.info}</p>}
      </div>
      {store.mapImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={store.mapImage} alt="MAP" className="mt-3 w-full rounded-lg" />
      )}
      {store.reservationUrl && (
        <a href={store.reservationUrl} target="_blank" rel="noopener noreferrer" className={`mt-3 ${BTN}`}>
          予約する →
        </a>
      )}
    </div>
  )
}

function BroadcastBlock({ broadcast }: { broadcast: EventBroadcast }) {
  const thumb = broadcast.image || resolveYoutubeThumbnail(undefined, broadcast.streamUrl)
  const inner = (
    <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gold-50">
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={broadcast.broadcastTitle ?? ""}
          style={{ aspectRatio: "16 / 9" }}
          className="w-32 shrink-0 rounded object-cover"
        />
      ) : (
        <div
          style={{ aspectRatio: "16 / 9" }}
          className="flex w-32 shrink-0 items-center justify-center rounded bg-gold-50 text-[10px] text-[#9a8aa0]"
        >
          {broadcast.platform ?? "NO IMAGE"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {broadcast.broadcastDate && (
          <p className="text-xs text-[#9a8aa0]">{broadcast.broadcastDate}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-[#3a2540]">{broadcast.broadcastTitle}</h3>
          {broadcast.platform && (
            <span className="shrink-0 rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-700">
              {broadcast.platform}
            </span>
          )}
        </div>
        {broadcast.info && <p className="truncate text-xs text-[#9a8aa0]">{broadcast.info}</p>}
      </div>
      {broadcast.streamUrl && <span className="shrink-0 text-gold-600">→</span>}
    </div>
  )
  return broadcast.streamUrl ? (
    <a href={broadcast.streamUrl} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : (
    <div className="block">{inner}</div>
  )
}

function PostBlock({ post }: { post: EventPost }) {
  const thumb = post.thumbnail || resolveYoutubeThumbnail(undefined, post.postUrl)
  const inner = (
    <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gold-50">
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={post.postTheme ?? ""}
          style={{ aspectRatio: "16 / 9" }}
          className="w-32 shrink-0 rounded object-cover"
        />
      ) : (
        <div
          style={{ aspectRatio: "16 / 9" }}
          className="w-32 shrink-0 rounded bg-gold-50"
        />
      )}
      <div className="min-w-0 flex-1">
        {post.postDate && <p className="text-xs text-[#9a8aa0]">{post.postDate}</p>}
        {post.postTheme && (
          <h3 className="truncate text-sm font-bold text-[#3a2540]">{post.postTheme}</h3>
        )}
        {post.info && <p className="truncate text-xs text-[#9a8aa0]">{post.info}</p>}
      </div>
      {post.postUrl && <span className="shrink-0 text-gold-600">→</span>}
    </div>
  )
  return post.postUrl ? (
    <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : (
    <div className="block">{inner}</div>
  )
}

function CampaignBlock({ campaign }: { campaign: EventCampaign }) {
  return (
    <div className={BLOCK}>
      {campaign.campaignName && (
        <h3 className="mb-2 font-bold text-gold-700">{campaign.campaignName}</h3>
      )}
      <div className="space-y-1 text-sm text-[#6a5570]">
        {campaign.entryPeriod && <p>応募期間: {campaign.entryPeriod}</p>}
        {campaign.entryMethod && <p>応募方法: {campaign.entryMethod}</p>}
        {campaign.prize && <p>賞品: {campaign.prize}</p>}
        {campaign.announceDate && <p>発表: {campaign.announceDate}</p>}
        {campaign.info && (
          <p className="mt-2 whitespace-pre-wrap text-xs text-[#9a8aa0]">{campaign.info}</p>
        )}
      </div>
      {campaign.entryUrl && (
        <a href={campaign.entryUrl} target="_blank" rel="noopener noreferrer" className={`mt-3 ${BTN}`}>
          応募する →
        </a>
      )}
    </div>
  )
}

function MediaBlock({ media }: { media: EventMedia }) {
  const inner = (
    <div className="flex items-center gap-3 p-3 transition-colors hover:bg-gold-50">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {media.mediaName && <h3 className="text-sm font-bold text-[#3a2540]">{media.mediaName}</h3>}
          {media.programName && <span className="text-sm text-[#6a5570]">{media.programName}</span>}
          {media.mediaType && (
            <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-700">
              {media.mediaType}
            </span>
          )}
        </div>
        {media.airDate && <p className="text-xs text-[#9a8aa0]">{media.airDate}</p>}
        {media.info && <p className="mt-1 whitespace-pre-wrap text-xs text-[#9a8aa0]">{media.info}</p>}
      </div>
      {media.url && <span className="shrink-0 text-gold-600">→</span>}
    </div>
  )
  return media.url ? (
    <a href={media.url} target="_blank" rel="noopener noreferrer" className={`block ${BLOCK} p-0`}>
      {inner}
    </a>
  ) : (
    <div className={`${BLOCK} p-0`}>{inner}</div>
  )
}

function EpisodeBlock({ episode }: { episode: EventEpisode }) {
  return (
    <div className={`${BLOCK} flex flex-col gap-3 sm:flex-row sm:items-start`}>
      {episode.thumbnail ? (
        <div
          style={{ aspectRatio: "16 / 9" }}
          className="relative w-full shrink-0 self-start overflow-hidden rounded-lg bg-gold-50 sm:w-56"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={episode.thumbnail}
            alt={episode.episodeTitle ?? ""}
            className="block h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          style={{ aspectRatio: "16 / 9" }}
          className="w-full shrink-0 self-start rounded-lg bg-gold-50 sm:w-56"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {episode.episodeNumber != null && (
            <span className="rounded-full bg-gold-400 px-2 py-0.5 text-xs font-bold text-white">
              #{String(episode.episodeNumber).padStart(2, "0")}
            </span>
          )}
          {episode.airDate && <span className="text-xs text-[#9a8aa0]">{episode.airDate}</span>}
        </div>
        {episode.episodeTitle && (
          <h3 className="mb-1 text-sm font-bold text-[#3a2540]">{episode.episodeTitle}</h3>
        )}
        {episode.guests && <p className="mb-1 text-xs text-[#9a8aa0]">ゲスト: {episode.guests}</p>}
        {episode.summary && (
          <p className="mb-2 line-clamp-3 whitespace-pre-wrap text-xs text-[#6a5570]">
            {episode.summary}
          </p>
        )}
        {episode.archiveUrl && (
          <a
            href={episode.archiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-gold-400 px-3 py-1.5 text-xs text-white transition-colors hover:bg-gold-500"
          >
            視聴する
          </a>
        )}
      </div>
    </div>
  )
}
