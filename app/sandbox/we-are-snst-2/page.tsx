import type { Metadata } from "next"
import { Michroma, Noto_Sans_JP, Anton, Lilita_One } from "next/font/google"
import { getLiveBySlug } from "@/lib/repo"
import { MEMBERS } from "@/data/members"
import { getGroupName } from "@/data/groups"
import { formatPeriod, getLiveStatus, getTicketStatus, formatDateDot } from "@/lib/utils"
import type { Venue, TicketLineup, TicketInfo } from "@/data/lives"
import SafeImage from "@/components/common/SafeImage"
import ImageGallery from "@/components/common/ImageGallery"
import Countdown from "./Countdown"
import FestivalMap, { type FestVenue } from "./FestivalMap"
import RevealOnScroll from "./RevealOnScroll"

/* ───────── フォント（このページにスコープ） ───────── */
// 見出し・英字: Michroma（公式サイトと同じ幾何学テック系）
const michroma = Michroma({ subsets: ["latin"], weight: ["400"], variable: "--snst-display", display: "swap" })
// 本文・和文: Noto Sans JP（公式サイトと同じ）
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--snst-body",
  display: "swap",
})
// 数字強調: Anton
const anton = Anton({ subsets: ["latin"], weight: ["400"], variable: "--snst-num", display: "swap" })
// ポップ見出し: Lilita One（KVのグラフィティ風ロゴ用の丸チャンキー書体）
const lilita = Lilita_One({ subsets: ["latin"], weight: ["400"], variable: "--snst-pop", display: "swap" })

const SLUG = "we-are-snst-2"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "We are SneakerStep! -2nd Step- | デザイン案（実データ）",
  description:
    "本番 /live/we-are-snst-2 のレイアウト・実データそのままに、夏フェス調デザインへ差し替えた仮ページ（サンドボックス）。",
}

/* ═══════════════ 装飾パーツ / 小物 ═══════════════ */
/** グッズ共通モチーフ：4点クロススパーク（✦）。装飾の最小単位はこれに統一。 */
function Sparkle({ className, size = 26 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 2 L56.5 43.5 L98 50 L56.5 56.5 L50 98 L43.5 56.5 L2 50 L43.5 43.5 Z" fill="currentColor" />
    </svg>
  )
}

/** グッズ共通モチーフ：5点スター（★）。メンバー/クラスプ等のアクセント。 */
function Star({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 5 L61 38 L96 38 L68 59 L79 92 L50 72 L21 92 L32 59 L4 38 L39 38 Z" fill="currentColor" />
    </svg>
  )
}

/** KVの世界観を出す常時アンビエント背景：上部のネオン流線＋全面の瞬くキラキラ。
 *  position:fixed で固定。カードは不透明なので可読性は損なわない。 */
function Ambient() {
  const stars: [number, number, number, number][] = [
    [120, 150, 26, 0], [1320, 110, 34, 0.6], [1180, 560, 22, 1.2], [240, 700, 18, 0.3],
    [780, 80, 16, 0.9], [1400, 430, 20, 1.5], [60, 450, 15, 0.4], [900, 770, 24, 0.8],
    [520, 300, 14, 1.1], [1060, 250, 16, 0.2], [360, 520, 12, 1.3], [1250, 810, 18, 0.5],
  ]
  return (
    <div className="snst-ambient" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="snst-amb-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="42" />
          </filter>
        </defs>
        {/* 上部の雲／光のテクスチャ（KVの空） */}
        <g filter="url(#snst-amb-blur)" opacity="0.55">
          <ellipse cx="300" cy="120" rx="220" ry="70" fill="#ffffff" />
          <ellipse cx="1120" cy="80" rx="260" ry="80" fill="#eafdff" />
          <ellipse cx="760" cy="40" rx="200" ry="60" fill="#ffffff" />
        </g>
        {/* 巨大アウトライン "SNEAKERSTEP" 透かし（#1） */}
        <text
          x="720" y="158" textAnchor="middle" fill="none" stroke="#ffffff" strokeWidth="2.2"
          style={{ fontFamily: "var(--snst-display),sans-serif", fontSize: "128px", letterSpacing: "7px", opacity: 0.22 }}
        >
          SNEAKERSTEP
        </text>
        {/* 上部に集めたネオン流線（下方向はフェードして白背景を汚さない） */}
        <g filter="url(#snst-amb-blur)" fill="none" strokeLinecap="round" opacity="0.42">
          <path d="M-60 180 C 360 60 560 280 980 130 C 1220 40 1380 170 1520 90" stroke="#ff4cd9" strokeWidth="26" />
          <path d="M-60 320 C 320 420 700 200 1040 360 C 1260 460 1400 300 1520 380" stroke="#52e5f6" strokeWidth="30" />
          <path d="M1520 240 C 1200 200 1080 360 760 300 C 520 250 320 360 -60 250" stroke="#4c32f0" strokeWidth="20" />
          <path d="M-60 120 C 280 200 480 60 760 150 C 1000 230 1180 110 1520 200" stroke="#8ce563" strokeWidth="18" />
          <path d="M1520 150 C 1240 90 1100 210 820 150 C 600 100 380 200 -60 150" stroke="#ffe24d" strokeWidth="16" />
        </g>
        {/* 疾走スピードライン（細い斜線の束） */}
        <g strokeLinecap="round" opacity="0.5">
          <line x1="1040" y1="640" x2="1440" y2="500" stroke="#8ce563" strokeWidth="3" />
          <line x1="1080" y1="700" x2="1430" y2="585" stroke="#ff4cd9" strokeWidth="2.5" />
          <line x1="60" y1="560" x2="380" y2="450" stroke="#52e5f6" strokeWidth="3" />
          <line x1="30" y1="700" x2="300" y2="610" stroke="#ffe24d" strokeWidth="2.5" />
          <line x1="900" y1="840" x2="1240" y2="740" stroke="#8ce563" strokeWidth="2.5" />
        </g>
        {/* 全面の瞬くキラキラ（透明度のみアニメ＝配置とアニメが衝突しない） */}
        <g>
          {stars.map(([x, y, s, d], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s / 100})`}>
              <path
                className="snst-amb-spark"
                style={{ animationDelay: `${d}s` }}
                transform="translate(-50 -50)"
                d="M50 2 L56.5 43.5 L98 50 L56.5 56.5 L50 98 L43.5 56.5 L2 50 L43.5 43.5 Z"
                fill="#cdf3ff"
              />
            </g>
          ))}
        </g>

        {/* KV signature：大きなネオン星バースト（ライム＆白の長い光条） */}
        <g>
          {([
            [120, 640, 1.2, 0, "#8ce563"], [1330, 300, 1.05, 0.7, "#7be8ff"],
            [1180, 730, 1.4, 1.3, "#8ce563"], [70, 250, 0.9, 0.4, "#ffe24d"],
            [1410, 560, 1.0, 1.8, "#ff4cd9"], [560, 820, 1.15, 1.0, "#8ce563"],
            [300, 130, 0.8, 0.5, "#7be8ff"], [840, 150, 0.85, 1.5, "#ffffff"],
            [1010, 600, 0.95, 0.9, "#8ce563"], [430, 470, 0.78, 1.2, "#ff4cd9"],
          ] as [number, number, number, number, string][]).map(([x, y, s, d, c], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <path
                className="snst-burst"
                style={{ animationDelay: `${d}s`, color: c }}
                d="M0 -62 L6 -7 L62 0 L7 6 L0 62 L-6 7 L-62 0 L-7 -6 Z"
                fill="currentColor"
              />
              <path
                className="snst-burst2"
                style={{ animationDelay: `${d}s` }}
                d="M0 -28 L4 -4 L28 0 L4 4 L0 28 L-4 4 L-28 0 L-4 -4 Z"
                fill="#ffffff"
              />
              <circle r="3.6" fill="#fff" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

/** グッズ共通の「SNST」モノグラム缶バッジ風タグ。 */
function SnstBadge({ className }: { className?: string }) {
  return (
    <span className={`snst-psticker ${className ?? ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="#fff" stroke="#361069" strokeWidth="4" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="#5cdeff" strokeWidth="2" strokeDasharray="3 3" />
        <text x="50" y="58" textAnchor="middle" fontFamily="var(--snst-display),sans-serif" fontSize="22" fill="#361069">SNST</text>
      </svg>
    </span>
  )
}

/** バックステージパス/半券風のクレデンシャル帯（バーコード＋ACCESS ALL AREA＋No.）。 */
function CredentialStrip({ color, no }: { color: string; no: string }) {
  return (
    <div className="snst-cred">
      <span className="snst-cred-bar" />
      <span className="snst-cred-txt">
        <b style={{ color }}>★</b> ACCESS ALL AREA
      </span>
      <span className="snst-cred-no">No.{no}</span>
    </div>
  )
}

/** HEROタイトル裏の白い液体スプラッシュ（KVのペイント感）。 */
function HeroSplash() {
  return (
    <svg className="snst-hero-splash" viewBox="0 0 300 160" aria-hidden="true">
      <path
        fill="#ffffff"
        d="M60 92 C40 70 70 44 96 58 C104 30 150 30 156 58 C188 40 214 70 196 96 C224 102 222 142 190 138 C182 162 132 162 122 138 C92 152 56 134 70 110 C44 116 40 96 60 92Z"
      />
    </svg>
  )
}

/** KV上下のテロップ風マーキー帯。inHero で HERO 枠内に隙間0で内包。 */
function Marquee({ variant, inHero }: { variant: "top" | "bottom"; inHero?: boolean }) {
  return (
    <div
      className={`snst-marquee snst-marquee--${variant} ${inHero ? "snst-marquee--inhero" : ""}`}
      aria-hidden="true"
    >
      <div className={`snst-marquee-track ${variant === "bottom" ? "is-rev" : ""}`}>
        {Array.from({ length: 2 }).map((_, k) => (
          <span key={k}>
            &nbsp;✦&nbsp; WE ARE SNEAKERSTEP -2nd Step- &nbsp;✦&nbsp; SUMMER FESTIVAL TOUR 2026 &nbsp;✦&nbsp; NISHIKI / RAO / DAIQUIRI / TACHIBANA / YUTAKUN / YANATO / OSADE &nbsp;✦&nbsp; ZEPP TOUR &nbsp;✦&nbsp;
          </span>
        ))}
      </div>
    </div>
  )
}

/** 公式サイトのタイトル装飾：大きさが増減するドットの弧。 */
function DotArc({ flip }: { flip?: boolean }) {
  const dots: [number, number, number][] = [
    [5, 40, 1.6], [17, 31, 2.2], [30, 23, 2.9], [45, 15, 3.6], [63, 7, 4.4],
  ]
  return (
    <svg className={`snst-dotarc ${flip ? "is-flip" : ""}`} width="72" height="46" viewBox="0 0 72 46" aria-hidden="true">
      {dots.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" opacity={0.45 + i * 0.13} />
      ))}
    </svg>
  )
}

/** 公式サイト風ネオン発光タイトル（英語大文字＋日本語サブ＋両脇のドット弧）。 */
function Heading({ en, jp, sub }: { en: string; jp: string; sub?: string }) {
  return (
    <div className="snst-heading-wrap">
      <div className="snst-heading">
        <DotArc />
      {/* 画像ではなく実テキストの見出し。SEO・スクリーンリーダー・選択/翻訳に対応。 */}
      <h2 className="snst-heading-center">
        <span className="snst-neon-en">{en}</span>
        <span className="snst-neon-jp">
          {jp}
          {sub && <i className="snst-neon-sub">{sub}</i>}
        </span>
        </h2>
        <DotArc flip />
      </div>
    </div>
  )
}

function CardHead({ title }: { title: string }) {
  return (
    <div className="snst-cardhead">
      <Star className="snst-cardhead-star" size={14} />
      {title}
    </div>
  )
}

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
function dayBadge(dateStr?: string): { label: string; cls: string } | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr ?? "")
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(d.getTime())) return null
  const day = d.getDay()
  const cls = day === 0 ? "sun" : day === 6 ? "sat" : "wd"
  return { label: DAY_LABELS[day], cls }
}

function mdDot(dateStr?: string): string {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr ?? "")
  if (!m) return ""
  return `${m[2].padStart(2, "0")}.${m[3].padStart(2, "0")}`
}
function venueDateLabel(v: Venue): string {
  const dates = (v.shows ?? []).map((s) => s.date).filter((d): d is string => !!d).sort()
  if (dates.length === 0) return ""
  return dates[0] === dates[dates.length - 1] ? mdDot(dates[0]) : `${mdDot(dates[0])}〜${mdDot(dates[dates.length - 1])}`
}

function lineupName(t: TicketLineup): string {
  return t.ticketName ?? t.name ?? ""
}
function lineupTags(t: TicketLineup): string[] {
  return (t.tags ?? "").split(/[/、,]/).map((s) => s.trim()).filter(Boolean)
}
function isUpgradeTicket(t: TicketLineup): boolean {
  const name = lineupName(t)
  const price = String(t.price ?? "").trim()
  return /VIP|アップグレード|アプグレ|ハイタッチ/i.test(name) || /アップグレード|アプグレ/.test(t.note ?? "") || /^[+＋]/.test(price)
}
function lineupPrice(t: TicketLineup): string {
  return typeof t.price === "number" ? `¥${t.price.toLocaleString()}` : ((t.price as string) ?? "")
}

/* ═══════════════ ページ（実データ取得） ═══════════════ */
export default async function Page() {
  const live = await getLiveBySlug(SLUG)

  if (!live) {
    return (
      <main className={`${michroma.variable} ${notoSansJP.variable} ${anton.variable} ${lilita.variable} snst-root`}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="snst-wrap">
          <div className="snst-empty">
            <Sparkle size={40} />
            <p className="snst-empty-title">データが取得できませんでした</p>
            <p className="snst-empty-text">
              slug <code>{SLUG}</code> のライブが Supabase に見つかりませんでした。
              本番 <code>/live/{SLUG}</code> が表示できているか確認してください。
            </p>
          </div>
        </div>
      </main>
    )
  }

  const status = getLiveStatus(live.periodStart, live.periodEnd)
  const venues = live.venues ?? []
  const members = MEMBERS.filter((m) => (live.memberSlugs ?? []).includes(m.id))
  const showCount = venues.reduce((sum, v) => sum + (v.shows && v.shows.length > 0 ? v.shows.length : 1), 0)
  const mapVenues: FestVenue[] = venues.map((v) => ({
    name: v.venueName,
    prefecture: v.prefecture ?? "",
    dateLabel: venueDateLabel(v),
  }))

  const statusLabel = status === "ongoing" ? "● LIVE NOW" : status === "coming" ? "COMING SOON" : "FINISHED"
  const statusCls = status === "ongoing" ? "snst-badge-lime" : status === "coming" ? "snst-badge-blue" : "snst-badge-gray"

  const hasTickets =
    (live.ticketLineup && live.ticketLineup.length > 0) || (live.ticketInfo && live.ticketInfo.length > 0)
  const hasGoods =
    (live.goodsImages && live.goodsImages.length > 0) ||
    (live.goodsReceiveMethods && live.goodsReceiveMethods.length > 0) ||
    (live.upgradeGoodsInfo && live.upgradeGoodsInfo.length > 0) ||
    !!live.commonVenueLimitedGoods ||
    !!live.commonVenueLimitedItems
  const hasFc =
    (live.fcInfo && live.fcInfo.length > 0) ||
    (live.liveViewing && live.liveViewing.length > 0) ||
    (live.ppvInfo && live.ppvInfo.length > 0)

  return (
    <main className={`${michroma.variable} ${notoSansJP.variable} ${anton.variable} ${lilita.variable} snst-root`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Ambient />
      <RevealOnScroll />

      <div className="snst-wrap">
        {/* ════════ HERO（上下にマーキー帯を内包・拡大） ════════ */}
        <section>
          <div className="snst-hero">
            <Marquee variant="top" inHero />
            <div className="snst-hero-grid">
            {/* KV */}
            <div className="snst-hero-kv">
              {live.keyVisual ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={live.keyVisual} alt={live.title} className="snst-hero-kv-img" />
              ) : (
                <div className="snst-hero-kv-art" aria-hidden>
                  <span className="snst-hero-kv-ghost">SNEAKERSTEP</span>
                  <Sparkle className="snst-kv-star snst-kv-star-1" size={34} />
                  <Sparkle className="snst-kv-star snst-kv-star-3" size={28} />
                </div>
              )}
            </div>

            {/* 情報パネル */}
            <div className="snst-hero-info">
              <HeroSplash />
              <SnstBadge className="snst-pstk-c" />
              <Star className="snst-pstk-star" />
              <div className="snst-badges">
                {live.groupSlug && <span className="snst-badge snst-badge-pink">{getGroupName(live.groupSlug)}</span>}
                {live.liveType && <span className="snst-badge snst-badge-outline">{live.liveType}</span>}
                {live.isFamily && <span className="snst-badge snst-badge-magenta">STPR Family</span>}
                <span className={`snst-badge ${statusCls}`}>{statusLabel}</span>
              </div>

              <h1 className="snst-hero-title-real">{live.title}</h1>
              {live.subtitle && <p className="snst-hero-sub">{live.subtitle}</p>}

              <div className="snst-hero-meta">
                <span className="snst-hero-period">{formatPeriod(live.periodStart, live.periodEnd)}</span>
                {venues.length > 0 && (
                  <span className="snst-hero-count">{venues.length}会場 {showCount}公演</span>
                )}
                {live.hashtag && <span className="snst-hero-hash">{live.hashtag}</span>}
              </div>

              {status === "coming" && live.periodStart && (
                <>
                  <p className="snst-cd-lead">▶▶▶ TOUR KICK-OFF まであと</p>
                  <Countdown target={live.periodStart} />
                </>
              )}

              {live.officialSiteUrl && (
                <a className="snst-btn snst-btn-pink" href={live.officialSiteUrl} target="_blank" rel="noopener noreferrer">
                  <Sparkle size={16} /> 公式サイトはこちら <span>↗</span>
                </a>
              )}
            </div>
            </div>
            <Marquee variant="bottom" inHero />
          </div>
        </section>

        {/* ════════ MEMBERS ════════ */}
        {members.length > 0 && (
          <section>
            <p className="snst-members-label">MEMBERS</p>
            <div className="snst-members">
              {members.map((m) => (
                <div key={m.id} className="snst-member">
                  <span className="snst-member-pic" style={{ borderColor: m.color }}>
                    <SafeImage
                      src={m.icon}
                      alt={m.name}
                      width={62}
                      height={62}
                      fallbackLabel={m.nameEn}
                      className="snst-member-img"
                    />
                  </span>
                  <span className="snst-member-name">{m.nameEn || m.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 説明 */}
        {live.description && <p className="snst-desc">{live.description}</p>}

        {/* ════════ 会場・公演スケジュール（日本地図） ════════ */}
        {venues.length > 0 && (
          <section>
            <Heading en="SCHEDULE" jp="会場・公演スケジュール" sub={`${venues.length}会場 / ${showCount}公演`} />
            <FestivalMap venues={mapVenues} />
          </section>
        )}

        {/* ════════ 公演情報 ════════ */}
        {venues.length > 0 && (
          <section>
            <Heading en="LIVE" jp="公演情報" />
            <div className="snst-venues">
              {venues.map((v, i) => {
                const shows = [...(v.shows ?? [])].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
                const goods = v.venueGoods ?? []
                const vc = VENUE_DOT[i % VENUE_DOT.length]
                const passNo = String(102 + i * 137).padStart(4, "0")
                return (
                  <div key={i} id={`snst-venue-${i}`} className="snst-venue-block">
                    <div className="snst-venue-head" style={{ borderBottomColor: vc }}>
                      <span className="snst-venue-star" style={{ color: vc }}><Star size={24} /></span>
                      <div className="snst-venue-head-main">
                        <span className="snst-venue-name">{v.venueName}</span>
                        {v.prefecture && <span className="snst-venue-pref">{v.prefecture}</span>}
                      </div>
                      {shows.length > 0 && <span className="snst-venue-count" style={{ background: vc }}>{shows.length}公演</span>}
                    </div>

                    {shows.length > 0 && (
                      <div className="snst-table-wrap">
                        <table className="snst-table">
                          <thead>
                            <tr><th>日程</th><th>部</th><th>スケジュール</th></tr>
                          </thead>
                          <tbody>
                            {shows.map((s, j) => {
                              const db = dayBadge(s.date)
                              return (
                                <tr key={j}>
                                  <td className="snst-td-date">
                                    {s.date ? formatDateDot(s.date) : "—"}
                                    {db && <span className={`snst-day snst-day-${db.cls}`}>{db.label}</span>}
                                  </td>
                                  <td className="snst-td-part">{s.partLabel || "—"}</td>
                                  <td className="snst-td-sched">{s.scheduleText || "—"}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {(goods.length > 0 || v.setlistNotes) && (
                      <div className="snst-venue-sub">
                        {goods.length > 0 && (
                          <div className="snst-sub-cell">
                            <p className="snst-sub-label">物販情報</p>
                            <div className="snst-goods-info">
                              {goods.map((g, k) => (
                                <div key={k} className="snst-goods-info-row">
                                  {g.saleType && <span className="snst-goods-tag">{g.saleType}</span>}
                                  <div className="snst-goods-lines">
                                    {g.seirikenPeriod && <p>整理券 申込期間：{g.seirikenPeriod}</p>}
                                    {g.lotteryResultDate && <p>当選発表日：{g.lotteryResultDate}</p>}
                                    {g.saleLocation && <p>販売場所：{g.saleLocation}</p>}
                                    {g.saleTime && <p>販売時間：{g.saleTime}</p>}
                                    {g.note && <p>{g.note}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {v.setlistNotes && (
                          <div className="snst-sub-cell">
                            <p className="snst-sub-label">セットリスト</p>
                            <p className="snst-setlist-note">🎵 {v.setlistNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <CredentialStrip color={vc} no={passNo} />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ════════ チケット情報 ════════ */}
        {hasTickets && (
          <section>
            <Heading en="TICKET" jp="チケット情報" />
            <div className="snst-ticket-grid">
              {live.ticketLineup && live.ticketLineup.length > 0 && (
                <div className="snst-card">
                  <CardHead title="チケット種別・料金" />
                  <div className="snst-card-body">
                    {live.ticketLineup.map((t, i) => {
                      const up = isUpgradeTicket(t)
                      const tags = lineupTags(t)
                      return (
                        <div key={i} className={`snst-lineup ${up ? "is-up" : ""}`}>
                          <div className="snst-lineup-main">
                            <p className="snst-lineup-name">{lineupName(t)}</p>
                            {t.note && <p className="snst-lineup-note">{t.note}</p>}
                            {tags.length > 0 && (
                              <div className="snst-lineup-tags">
                                {tags.map((tag) => (
                                  <span key={tag} className="snst-lineup-tag">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          {lineupPrice(t) && (
                            <span className="snst-lineup-price">
                              {lineupPrice(t)}
                              {typeof t.price === "number" && <i>税込</i>}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <CredentialStrip color="#4c32f0" no="0402" />
                </div>
              )}

              {live.ticketInfo && live.ticketInfo.length > 0 && (
                <div className="snst-card">
                  <CardHead title="TICKETスケジュール" />
                  <div className="snst-card-body snst-ticket-sched">
                    {[...live.ticketInfo].reverse().map((t, i) => (
                      <TicketScheduleItem key={i} ticket={t} />
                    ))}
                  </div>
                  <CredentialStrip color="#52e5f6" no="0830" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ════════ グッズ情報 ════════ */}
        {hasGoods && (
          <section>
            <Heading en="GOODS" jp="グッズ情報" />
            <div className="snst-goods-banner">
              <Sparkle size={18} /> オフィシャルグッズ <Sparkle size={18} />
            </div>

            {live.goodsImages && live.goodsImages.length > 0 && (
              <div className="snst-gallery-wrap">
                <ImageGallery images={live.goodsImages} />
              </div>
            )}

            {live.upgradeGoodsInfo && live.upgradeGoodsInfo.length > 0 && (
              <div className="snst-gallery-wrap">
                <p className="snst-sub-label">アプグレグッズ情報</p>
                <ImageGallery images={live.upgradeGoodsInfo} />
              </div>
            )}

            {live.goodsReceiveMethods && live.goodsReceiveMethods.length > 0 && (
              <div className="snst-receive">
                {live.goodsReceiveMethods.map((m, i) => (
                  <div key={i} className="snst-receive-item">
                    <div className="snst-receive-head">
                      <span className="snst-receive-method">{m.method || "受付"}</span>
                      {m.purchaseUrl && (
                        <a className="snst-receive-link" href={m.purchaseUrl} target="_blank" rel="noopener noreferrer">
                          申込・購入 ↗
                        </a>
                      )}
                    </div>
                    <div className="snst-receive-body">
                      {m.salePeriod && <p>受付期間：{m.salePeriod}</p>}
                      {m.deliveryInfo && <p>配送・受取：{m.deliveryInfo}</p>}
                      {m.purchaseBonus && <p>購入特典：{m.purchaseBonus}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(live.commonVenueLimitedGoods || live.commonVenueLimitedItems) && (
              <div className="snst-limited">
                {live.commonVenueLimitedGoods && (
                  <div className="snst-limited-item">
                    <p className="snst-sub-label">会場限定グッズ（全会場共通）</p>
                    <div className="rte-content" dangerouslySetInnerHTML={{ __html: live.commonVenueLimitedGoods }} />
                  </div>
                )}
                {live.commonVenueLimitedItems && (
                  <div className="snst-limited-item">
                    <p className="snst-sub-label">会場限定配布物（全会場共通）</p>
                    <div className="rte-content" dangerouslySetInnerHTML={{ __html: live.commonVenueLimitedItems }} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ════════ FC・配信情報 ════════ */}
        {hasFc && (
          <section>
            <Heading en="FANCLUB" jp="FC・配信情報" />
            <div className="snst-fc-grid">
              {live.fcInfo && live.fcInfo.length > 0 && (
                <div className="snst-card">
                  <CardHead title="FC情報" />
                  <div className="snst-card-body snst-fc-imgs">
                    {live.fcInfo.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt={`FC情報${i + 1}`} className="snst-fc-img" />
                    ))}
                  </div>
                </div>
              )}

              {live.liveViewing && live.liveViewing.length > 0 && (
                <div className="snst-card">
                  <CardHead title="ライブビューイング" />
                  <div className="snst-card-body snst-fc-info">
                    {live.liveViewing.map((lv, i) => (
                      <div key={i} className="snst-fc-info-block">
                        {lv.title && <p className="snst-fc-info-title">{lv.title}</p>}
                        {lv.screeningDate && <p>{lv.screeningDate}</p>}
                        {lv.price && <p>{lv.price}</p>}
                        {lv.info && <p className="snst-fc-info-note">{lv.info}</p>}
                        <div className="snst-fc-links">
                          {lv.theatersUrl && (
                            <a className="snst-textlink" href={lv.theatersUrl} target="_blank" rel="noopener noreferrer">劇場一覧 ↗</a>
                          )}
                          {lv.purchaseUrl && (
                            <a className="snst-textlink" href={lv.purchaseUrl} target="_blank" rel="noopener noreferrer">チケット購入 ↗</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {live.ppvInfo && live.ppvInfo.length > 0 && (
                <div className="snst-card">
                  <CardHead title="配信（PPV）情報" />
                  <div className="snst-card-body snst-fc-info">
                    {live.ppvInfo.map((p, i) => (
                      <div key={i} className="snst-fc-info-block">
                        {p.platform && <p className="snst-fc-info-title">{p.platform}</p>}
                        {p.viewingPeriod && <p>{p.viewingPeriod}</p>}
                        {p.price && <p>{p.price}</p>}
                        {p.info && <p className="snst-fc-info-note">{p.info}</p>}
                        {p.purchaseUrl && (
                          <a className="snst-textlink" href={p.purchaseUrl} target="_blank" rel="noopener noreferrer">視聴する ↗</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <p className="snst-foot-note">
          ※ 本ページは <code>/live/{SLUG}</code> の<b>レイアウト・実データそのまま</b>に、デザインのみ夏フェス調へ差し替えた仮案です（本番は未変更）。
        </p>
      </div>
    </main>
  )
}

// 会場ドットの配色（夏フェス調パレット）
const VENUE_DOT = ["#FF6BB5", "#2E6BFF", "#8CE563", "#FFD93D", "#00C2D6", "#FF9F45", "#B06BFF"]

/* ── チケットスケジュール1件（受付ステータス自動判定） ── */
function TicketScheduleItem({ ticket }: { ticket: TicketInfo }) {
  const ticketType = ticket.ticketType || ticket.name || ""
  const method = ticket.method ?? ticket.saleType
  const saleStart = ticket.saleStart ?? ticket.sale_start
  const saleEnd = ticket.saleEnd ?? ticket.sale_end
  const info = ticket.info ?? ticket.note
  const status = getTicketStatus(saleStart, saleEnd, ticket.salePeriod)
  const isOpen = status === "受付中"
  const isClosed = status === "受付終了"
  const outlets = (ticket.salesOutlets ?? []).filter(
    (o) => o.name || o.url || (o.showRefs?.length ?? 0) > 0 || (o.ticketScopes?.length ?? 0) > 0,
  )

  return (
    <div className={`snst-tk ${isOpen ? "is-open" : isClosed ? "is-closed" : ""}`}>
      <div className="snst-tk-head">
        <div className="snst-tk-head-l">
          <span className="snst-tk-type">{ticketType}</span>
          {method && <span className="snst-tk-method">{method}</span>}
        </div>
        {status && (
          <span className={`snst-tk-status ${isOpen ? "open" : isClosed ? "closed" : "before"}`}>{status}</span>
        )}
      </div>
      {ticket.salePeriod && <p className="snst-tk-period">{ticket.salePeriod}</p>}
      {ticket.price && <p className="snst-tk-period">{ticket.price}</p>}
      {info && <p className="snst-tk-info">{info}</p>}
      {outlets.length > 0 && (
        <div className="snst-tk-outlets">
          {outlets.map((o, i) => {
            const scopes = (o.ticketScopes ?? []).filter((s) => s.ticketLineupRef || (s.showRefs?.length ?? 0) > 0)
            return (
              <div key={i} className="snst-tk-outlet-card">
                <div className="snst-tk-outlet-head">
                  <span className="snst-tk-outlet-name">{o.name || "販売場所"}</span>
                  {o.url && !isClosed && (
                    <a className="snst-tk-outlet-link" href={o.url} target="_blank" rel="noopener noreferrer">申込 ↗</a>
                  )}
                </div>
                {scopes.length > 0 ? (
                  <div className="snst-tk-scopes">
                    {scopes.map((s, j) => (
                      <p key={j}>
                        {s.ticketLineupRef && <b>{s.ticketLineupRef}</b>}
                        {s.showRefs && s.showRefs.length > 0 && <span>：{s.showRefs.join("、")}</span>}
                      </p>
                    ))}
                  </div>
                ) : (
                  o.showRefs && o.showRefs.length > 0 && <p className="snst-tk-scope-line">対象公演：{o.showRefs.join("、")}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════ CSS ════════════════════════ */
const CSS = `
.snst-root{
  /* 公式サイト（sneakerstep-zepptour2026）準拠パレット */
  --cyan:#5cdeff; --cyan2:#52e5f6; --pink:#ff4cd9; --magenta:#eb0bbd;
  --yellow:#ffe24d; --lime:#3ad07a; --blue:#009dff; --violet:#4c32f0; --navy:#361069;
  font-family:var(--snst-body),"Noto Sans JP",sans-serif;
  color:var(--navy);
  -webkit-font-smoothing:antialiased;
  position:relative;
  min-height:100vh;
  /* 上部シアン → 下部ホワイトのクリーンなグラデ＋極薄グリッド */
  background:
    repeating-linear-gradient(0deg,rgba(54,16,105,.045) 0 1px,transparent 1px 44px),
    repeating-linear-gradient(90deg,rgba(54,16,105,.045) 0 1px,transparent 1px 44px),
    radial-gradient(135% 70% at 50% -8%,#5cdeff 0%,#9fecff 24%,#dff8ff 52%,#ffffff 100%);
  background-attachment:fixed;
}
.snst-root *{box-sizing:border-box;}
/* KV世界観のアンビエント背景（固定・装飾・操作不可） */
.snst-ambient{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
.snst-ambient svg{width:100%;height:100%;display:block;}
.snst-amb-spark{transform-box:fill-box;transform-origin:center;animation:snst-amb-tw 3.4s ease-in-out infinite;}
@keyframes snst-amb-tw{0%,100%{opacity:.2;}50%{opacity:.65;}}
.snst-burst{transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 5px currentColor) drop-shadow(0 0 10px currentColor);animation:snst-burst-a 4.2s ease-in-out infinite;}
.snst-burst2{transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 4px #fff);animation:snst-burst-a 4.2s ease-in-out infinite;}
@keyframes snst-burst-a{0%,100%{opacity:.45;transform:scale(.82) rotate(0deg);}50%{opacity:.95;transform:scale(1.12) rotate(22deg);}}
@media (prefers-reduced-motion:reduce){ .snst-amb-spark,.snst-burst,.snst-burst2{animation:none;opacity:.5;} }
.snst-wrap{position:relative;z-index:1;max-width:980px;margin:0 auto;padding:40px 18px 80px;display:flex;flex-direction:column;gap:48px;}

/* スクロール出現（JS が .snst-anim-ready を付けた時だけ有効＝JS無効でも表示） */
.snst-anim-ready .snst-wrap > section,
.snst-anim-ready .snst-wrap > p{opacity:0;transform:translateY(20px);}
.snst-anim-ready .snst-wrap > section.is-in,
.snst-anim-ready .snst-wrap > p.is-in{opacity:1;transform:none;transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1);}

/* マーキー帯（公式テロップ＝緑背景×青文字。KV上下のバンド） */
.snst-marquee{overflow:hidden;border:3px solid var(--navy);border-radius:12px;background:#5fd13c;box-shadow:0 5px 0 rgba(54,16,105,.16);padding:8px 0;}
.snst-marquee--top{background:#5fd13c;}
.snst-marquee--bottom{background:#5fd13c;}
/* HERO 内包：枠・角丸・影を消して隙間0でフラットに収める */
.snst-marquee--inhero{border:0;border-radius:0;box-shadow:none;padding:7px 0;}
.snst-marquee--inhero.snst-marquee--top{border-bottom:3px solid var(--navy);}
.snst-marquee--inhero.snst-marquee--bottom{border-top:3px solid var(--navy);}
.snst-marquee-track{display:inline-flex;white-space:nowrap;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:13px;letter-spacing:.05em;color:#123fd6;animation:snst-scroll 26s linear infinite;}
.snst-marquee-track.is-rev{animation-direction:reverse;}
@keyframes snst-scroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}
@media(prefers-reduced-motion:reduce){ .snst-marquee-track{animation:none;} }

/* ── 空状態 ── */
.snst-empty{text-align:center;background:#fff;border:3px solid var(--navy);border-radius:20px;padding:48px 24px;color:var(--navy);box-shadow:0 8px 0 rgba(54,16,105,.16);}
.snst-empty svg{color:var(--yellow);}
.snst-empty-title{margin:10px 0 6px;font-family:var(--snst-display),sans-serif;font-size:20px;}
.snst-empty-text{margin:0;font-size:13px;color:#5a6c8a;line-height:1.8;}
.snst-empty code,.snst-foot-note code{font-family:var(--snst-num),sans-serif;background:rgba(54,16,105,.1);padding:1px 6px;border-radius:5px;}

/* ── HERO ── */
.snst-hero{position:relative;display:flex;flex-direction:column;border:3px solid var(--navy);border-radius:24px;overflow:hidden;box-shadow:0 10px 0 rgba(54,16,105,.18);background:#fff;}
.snst-hero-grid{display:grid;grid-template-columns:1fr;}
@media(min-width:980px){ .snst-hero-grid{grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);} }
.snst-hero-kv{position:relative;min-height:250px;order:1;display:flex;align-items:center;justify-content:center;background:radial-gradient(95% 95% at 30% 18%,#7ce8ff,#52e5f6 45%,#009dff 100%);}
@media(min-width:980px){ .snst-hero-kv{order:2;min-height:500px;} }
.snst-hero-kv-img{display:block;width:100%;height:auto;}
@media(min-width:980px){ .snst-hero-kv-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;} }
.snst-hero-kv-art{position:absolute;inset:0;overflow:hidden;}
.snst-hero-kv-ghost{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-4deg);font-family:var(--snst-display),sans-serif;font-size:clamp(34px,9vw,72px);white-space:nowrap;color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.6);}
.snst-kv-star{position:absolute;color:#fff;animation:snst-tw 2.6s ease-in-out infinite;}
.snst-kv-star-1{top:16%;left:14%;color:var(--yellow);}
.snst-kv-star-3{top:30%;right:16%;color:var(--pink);animation-delay:1s;}
@keyframes snst-tw{0%,100%{opacity:.4;transform:scale(.8) rotate(0);}50%{opacity:1;transform:scale(1.15) rotate(20deg);}}
.snst-hero-info{order:2;position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;gap:14px;padding:32px 24px;background:linear-gradient(155deg,#4c32f0 0%,#009dff 55%,#52e5f6 100%);color:#fff;}
.snst-hero-splash{position:absolute;left:4%;bottom:6%;width:66%;max-width:300px;height:auto;opacity:.16;z-index:-1;pointer-events:none;filter:drop-shadow(0 0 14px rgba(255,255,255,.5));}
.snst-psticker{position:absolute;z-index:2;pointer-events:none;filter:drop-shadow(0 3px 4px rgba(54,16,105,.32));}
.snst-psticker svg{display:block;width:100%;height:100%;}
.snst-pstk-c{width:56px;height:56px;left:14px;bottom:12px;transform:rotate(-7deg);}
.snst-pstk-star{position:absolute;z-index:2;top:13px;right:14px;width:30px;height:30px;color:var(--yellow);pointer-events:none;filter:drop-shadow(0 2px 3px rgba(54,16,105,.32));transform:rotate(8deg);}
@media(min-width:980px){ .snst-pstk-c{width:68px;height:68px;} .snst-pstk-star{width:38px;height:38px;} }

@media(min-width:980px){ .snst-hero-info{order:1;justify-content:center;gap:16px;padding:54px 48px;} }
.snst-badges{display:flex;flex-wrap:wrap;gap:7px;}
.snst-badge{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:11px;letter-spacing:.04em;padding:4px 11px;border-radius:7px;border:2px solid #fff;}
.snst-badge-pink{background:var(--pink);color:#fff;}
.snst-badge-outline{background:rgba(255,255,255,.12);color:#fff;}
.snst-badge-lime{background:var(--lime);color:#fff;}
.snst-badge-magenta{background:var(--magenta);color:#fff;}
.snst-badge-blue{background:var(--blue);color:#fff;}
.snst-badge-gray{background:rgba(255,255,255,.2);color:#fff;}
.snst-hero-title-real{position:relative;z-index:1;margin:0;font-family:var(--snst-pop),sans-serif;font-weight:400;font-size:clamp(30px,6.4vw,54px);line-height:1.02;letter-spacing:.005em;color:var(--pink);-webkit-text-stroke:2.5px #fff;paint-order:stroke fill;text-shadow:0 3px 0 #b80aa0,3px 5px 0 rgba(54,16,105,.32),0 0 16px rgba(255,76,217,.55),0 0 30px rgba(124,232,255,.4);}
.snst-hero-sub{margin:0;font-size:13px;color:rgba(255,255,255,.85);font-weight:500;}
.snst-hero-meta{display:flex;flex-direction:column;gap:3px;font-size:13px;}
.snst-hero-period{font-family:var(--snst-num),sans-serif;font-size:17px;letter-spacing:.02em;}
.snst-hero-count{color:rgba(255,255,255,.85);}
.snst-hero-hash{color:rgba(255,255,255,.6);font-size:12px;}
.snst-cd-lead{margin:6px 0 2px;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:12px;color:var(--navy);background:#fff;display:inline-block;width:fit-content;padding:4px 14px;border-radius:999px;box-shadow:0 3px 0 rgba(54,16,105,.18);}

/* ── カウントダウン ── */
.snst-countdown{display:flex;gap:6px;flex-wrap:wrap;}
.snst-cd-cell{position:relative;display:flex;flex-direction:column;align-items:center;}
.snst-cd-num{font-family:var(--snst-num),sans-serif;font-size:clamp(26px,7vw,40px);line-height:1;color:var(--navy);background:#fff;border:3px solid var(--navy);border-radius:11px;padding:6px 10px;min-width:54px;text-align:center;box-shadow:0 5px 0 rgba(54,16,105,.22);}
.snst-cd-label{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:10px;letter-spacing:.1em;color:#fff;margin-top:6px;text-shadow:0 1px 2px rgba(54,16,105,.95),0 0 6px rgba(54,16,105,.6);}
.snst-cd-colon{position:absolute;right:-8px;top:12px;font-family:var(--snst-num),sans-serif;font-size:24px;color:#fff;text-shadow:0 1px 3px rgba(54,16,105,.9);}

/* ── ボタン ── */
.snst-btn{display:inline-flex;align-items:center;gap:9px;width:fit-content;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:15px;padding:13px 28px;border-radius:999px;border:3px solid #fff;text-decoration:none;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease;}
.snst-btn span{transition:transform .15s ease;}
.snst-btn:hover{transform:translateY(-3px);}
.snst-btn:hover span{transform:translate(3px,-2px);}
.snst-btn-pink{background:var(--pink);color:#fff;box-shadow:0 6px 0 #b80aa0;}
.snst-btn-navy{background:var(--navy);color:#fff;box-shadow:0 6px 0 #1e0942;}
.snst-btn-sm{font-size:13px;padding:10px 20px;border-width:2px;margin-top:4px;}

/* ── MEMBERS ── */
.snst-members-label{text-align:center;margin:0 0 16px;font-family:var(--snst-body),sans-serif;font-weight:800;letter-spacing:.18em;font-size:12px;color:#fff;text-shadow:0 2px 4px rgba(54,16,105,.4);}
.snst-members{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;}
.snst-member{display:flex;flex-direction:column;align-items:center;gap:6px;width:74px;}
.snst-member-pic{position:relative;display:flex;align-items:center;justify-content:center;width:62px;height:62px;border-radius:50%;overflow:hidden;background:#fff;border:3px solid;box-shadow:0 4px 0 rgba(54,16,105,.18);transition:transform .15s ease;}
.snst-member:hover .snst-member-pic{transform:scale(1.1) rotate(-4deg);}
.snst-member-img{width:100%;height:100%;object-fit:cover;}
.snst-member-name{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:10px;color:#fff;text-shadow:0 1px 3px rgba(54,16,105,.4);}

/* ── 説明 ── */
.snst-desc{margin:0;max-width:760px;white-space:pre-wrap;font-family:var(--snst-body),sans-serif;font-weight:500;font-size:14px;line-height:1.95;color:var(--navy);background:rgba(255,255,255,.72);border:2px dashed rgba(54,16,105,.25);border-radius:16px;padding:18px 20px;}

/* ── セクション見出し（公式サイト風ネオン発光タイトル） ── */
.snst-heading-wrap{display:flex;flex-direction:column;align-items:center;gap:16px;margin-bottom:26px;}
.snst-heading{display:flex;align-items:center;justify-content:center;gap:clamp(8px,3vw,22px);}
.snst-heading-center{margin:0;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;font-weight:inherit;}
.snst-neon-en{
  font-family:var(--snst-display),sans-serif;
  font-size:clamp(30px,7.5vw,56px);line-height:1;letter-spacing:.05em;
  background:linear-gradient(180deg,#eafdff 0%,#7ce8ff 38%,#009dff 72%,#4c32f0 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  -webkit-text-stroke:1.4px #fff;
  filter:
    drop-shadow(0 0 4px rgba(92,222,255,.95))
    drop-shadow(0 0 11px rgba(0,157,255,.7))
    drop-shadow(0 0 20px rgba(76,50,240,.55))
    drop-shadow(0 2px 0 rgba(54,16,105,.35));
}
.snst-neon-jp{font-family:var(--snst-body),sans-serif;font-weight:700;font-size:clamp(13px,3vw,16px);letter-spacing:.06em;color:#0090ea;text-shadow:0 0 7px rgba(92,222,255,.85),0 0 2px rgba(255,255,255,.9);}
.snst-neon-sub{font-style:normal;font-family:var(--snst-num),sans-serif;font-size:13px;color:var(--magenta);margin-left:8px;text-shadow:none;}
.snst-dotarc{flex:none;color:var(--cyan);filter:drop-shadow(0 0 3px rgba(92,222,255,.8));}
.snst-dotarc.is-flip{transform:scaleX(-1);}

/* ── 共通カード ── */
.snst-card{position:relative;background:#fff;border:3px solid var(--navy);border-radius:18px;overflow:hidden;box-shadow:0 7px 0 rgba(54,16,105,.14);}
.snst-cardhead{display:flex;align-items:center;gap:8px;background:var(--navy);color:#fff;padding:11px 16px;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:12px;letter-spacing:.06em;}
.snst-cardhead-star{flex:none;color:var(--yellow);filter:drop-shadow(0 1px 1px rgba(0,0,0,.2));}
.snst-card-body{padding:14px 16px;}

/* ── 地図 ── */
.snst-map-card{background:#fff;border:3px solid var(--navy);border-radius:20px;overflow:hidden;box-shadow:0 8px 0 rgba(54,16,105,.16);}
.snst-map-grid{display:grid;grid-template-columns:1fr;}
@media(min-width:760px){ .snst-map-grid{grid-template-columns:1fr 300px;} }
.snst-map-list{display:flex;flex-direction:column;gap:9px;padding:18px;border-bottom:3px solid var(--navy);}
@media(min-width:760px){ .snst-map-list{border-bottom:0;border-right:3px solid var(--navy);} }
.snst-map-list-label{margin:0 0 4px;font-family:var(--snst-body),sans-serif;font-weight:800;letter-spacing:.12em;font-size:11px;color:var(--pink);}
.snst-map-item{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:#f3fcfe;border:2px solid rgba(54,16,105,.12);border-radius:13px;padding:10px 13px;cursor:pointer;transition:transform .12s ease,border-color .12s ease,background .12s ease;}
.snst-map-item:hover{transform:translateX(3px);border-color:var(--pink);}
.snst-map-item.is-active{border-color:var(--pink);background:#fff0f8;}
.snst-map-no{font-family:var(--snst-num),sans-serif;font-size:20px;color:var(--pink);min-width:26px;}
.snst-map-item-main{display:flex;flex-direction:column;flex:1;min-width:0;}
.snst-map-item-name{font-family:var(--snst-display),sans-serif;font-size:14px;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.snst-map-item-sub{font-family:var(--snst-body),sans-serif;font-weight:500;font-size:11px;color:#5a6c8a;}
.snst-map-arrow{margin-left:auto;font-size:18px;color:rgba(54,16,105,.3);}
.snst-map-canvas{display:flex;align-items:center;justify-content:center;padding:14px;background:linear-gradient(160deg,#d9f8fd,#bff0f8);}
.snst-map-svg{width:100%;max-width:230px;height:auto;max-height:300px;}

/* ── 公演情報 ── */
.snst-venues{display:flex;flex-direction:column;gap:16px;}
.snst-venue-block{position:relative;scroll-margin-top:20px;background:#fff;border:3px solid var(--navy);border-radius:18px;overflow:hidden;box-shadow:0 7px 0 rgba(54,16,105,.14);}
/* ホログラム/ラメ光沢：カード上端の虹色シーン（#Add3） */
.snst-venue-block::before,.snst-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;z-index:1;background:linear-gradient(90deg,#ff4cd9,#ffe24d,#8ce563,#52e5f6,#b06bff);opacity:.92;}
/* バックステージパス/半券風クレデンシャル帯（#Replace2 / #Add2） */
.snst-cred{display:flex;align-items:center;gap:12px;padding:9px 18px;border-top:2px dashed rgba(54,16,105,.22);background:#fbfdff;}
.snst-cred-bar{flex:none;width:72px;height:20px;border-radius:2px;opacity:.85;background:repeating-linear-gradient(90deg,#361069 0 2px,#fff 2px 3px,#361069 3px 5px,#fff 5px 8px,#361069 8px 9px,#fff 9px 12px);}
.snst-cred-txt{font-family:var(--snst-display),sans-serif;font-size:10px;letter-spacing:.13em;color:var(--navy);}
.snst-cred-txt b{font-style:normal;}
.snst-cred-no{margin-left:auto;font-family:var(--snst-num),sans-serif;font-size:14px;letter-spacing:.04em;color:var(--navy);}
.snst-venue-head{display:flex;align-items:center;gap:12px;background:#f3fcfe;border-bottom:3px solid var(--navy);padding:14px 18px;}
.snst-venue-star{flex:none;display:flex;align-items:center;filter:drop-shadow(0 1px 1px rgba(54,16,105,.3));}
.snst-venue-head-main{min-width:0;}
.snst-venue-name{font-family:var(--snst-display),sans-serif;font-size:16px;color:var(--navy);}
.snst-venue-pref{margin-left:7px;font-family:var(--snst-body),sans-serif;font-weight:500;font-size:12px;color:#5a6c8a;}
.snst-venue-count{margin-left:auto;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:12px;color:#fff;background:var(--pink);padding:3px 11px;border-radius:999px;}
.snst-table-wrap{overflow-x:auto;border-bottom:2px dashed rgba(54,16,105,.15);}
.snst-table{width:100%;border-collapse:collapse;text-align:center;font-size:13px;}
.snst-table thead tr{background:var(--navy);color:#fff;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:11px;letter-spacing:.06em;}
.snst-table th{padding:9px 14px;}
.snst-table td{padding:12px 14px;border-bottom:1px solid rgba(54,16,105,.08);}
.snst-table tbody tr:last-child td{border-bottom:0;}
.snst-table tbody tr:nth-child(even){background:#f7fdff;}
.snst-td-date{font-family:var(--snst-num),sans-serif;font-size:16px;color:var(--navy);white-space:nowrap;}
.snst-day{margin-left:6px;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:10px;padding:2px 6px;border-radius:5px;vertical-align:middle;}
.snst-day-sun{background:#ffe0ec;color:#d6437f;}
.snst-day-sat{background:#dde9ff;color:#2e6bff;}
.snst-day-wd{background:#eef2f7;color:#7a89a3;}
.snst-td-part{font-family:var(--snst-display),sans-serif;color:var(--pink);font-size:15px;}
.snst-td-sched{font-family:var(--snst-body),sans-serif;font-weight:500;color:#5a6c8a;}
.snst-venue-sub{display:grid;grid-template-columns:1fr;}
@media(min-width:680px){ .snst-venue-sub{grid-template-columns:1fr 1fr;} }
.snst-sub-cell{padding:16px 18px;}
@media(min-width:680px){ .snst-venue-sub .snst-sub-cell:first-child{border-right:2px dashed rgba(54,16,105,.15);} }
.snst-sub-label{margin:0 0 9px;font-family:var(--snst-body),sans-serif;font-weight:800;letter-spacing:.08em;font-size:11px;color:#7a89a3;}
.snst-goods-info{display:flex;flex-direction:column;gap:9px;}
.snst-goods-info-row{border:2px solid rgba(54,16,105,.12);border-radius:12px;padding:11px 13px;}
.snst-goods-tag{display:inline-block;margin-bottom:7px;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:11px;color:#d6437f;background:#ffe9f3;padding:2px 10px;border-radius:999px;}
.snst-goods-lines p{margin:2px 0;font-family:var(--snst-body),sans-serif;font-weight:500;font-size:12px;color:#5a6c8a;white-space:pre-wrap;}
.snst-setlist-note{margin:0;font-family:var(--snst-body),sans-serif;font-weight:700;font-size:13px;color:var(--navy);background:#f3fcfe;border:2px dashed rgba(54,16,105,.18);border-radius:12px;padding:11px 13px;}

/* ── チケット ── */
.snst-ticket-grid{display:grid;grid-template-columns:1fr;gap:16px;}
@media(min-width:880px){ .snst-ticket-grid{grid-template-columns:1fr 1fr;align-items:start;} }
.snst-lineup{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:11px 4px;border-bottom:1px solid rgba(54,16,105,.1);}
.snst-lineup:last-child{border-bottom:0;}
.snst-lineup.is-up{margin:6px 0;border:0;border-radius:12px;background:linear-gradient(140deg,#fff3fa,#fffbe9);padding:13px;}
.snst-lineup-name{margin:0;font-family:var(--snst-body),sans-serif;font-weight:800;font-size:14px;color:var(--navy);}
.snst-lineup.is-up .snst-lineup-name{color:#d6437f;}
.snst-lineup-note{margin:3px 0 0;font-family:var(--snst-body),sans-serif;font-weight:500;font-size:11px;color:#5a6c8a;}
.snst-lineup-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;}
.snst-lineup-tag{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:10px;color:#d6437f;background:#ffe9f3;padding:2px 8px;border-radius:6px;}
.snst-lineup-price{font-family:var(--snst-num),sans-serif;font-size:20px;color:var(--navy);white-space:nowrap;}
.snst-lineup.is-up .snst-lineup-price{color:#d6437f;}
.snst-lineup-price i{font-family:var(--snst-body),sans-serif;font-style:normal;font-weight:500;font-size:10px;color:#9aa7bd;margin-left:3px;}
.snst-ticket-sched{display:flex;flex-direction:column;gap:10px;}
.snst-tk{border:2px solid rgba(54,16,105,.14);border-radius:13px;padding:12px 13px;background:#fafdff;}
.snst-tk.is-open{border-color:var(--lime);background:#f3fff0;}
.snst-tk.is-closed{opacity:.72;background:#f1f3f6;}
.snst-tk-head{display:flex;justify-content:space-between;align-items:center;gap:10px;}
.snst-tk-head-l{display:flex;flex-wrap:wrap;align-items:center;gap:7px;min-width:0;}
.snst-tk-type{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:13px;color:var(--navy);}
.snst-tk-method{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:10px;color:#7a89a3;background:#eef2f7;padding:2px 7px;border-radius:5px;}
.snst-tk-status{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:11px;padding:3px 11px;border-radius:999px;white-space:nowrap;}
.snst-tk-status.open{background:#d8f7cd;color:#3a9b3a;border:1px solid #a7e394;}
.snst-tk-status.before{background:#eef2f7;color:#7a89a3;border:1px solid #d6dde7;}
.snst-tk-status.closed{background:#e5e7eb;color:#9aa3b2;border:1px solid #d6dde7;}
.snst-tk-period{margin:8px 0 0;font-family:var(--snst-num),sans-serif;font-size:13px;color:#5a6c8a;}
.snst-tk-info{margin:6px 0 0;font-family:var(--snst-body),sans-serif;font-weight:500;font-size:11px;color:#5a6c8a;white-space:pre-wrap;}
.snst-tk-outlets{margin-top:10px;display:flex;flex-direction:column;gap:7px;}
.snst-tk-outlet-card{border:2px solid rgba(54,16,105,.12);border-radius:10px;padding:9px 11px;background:#fff;}
.snst-tk-outlet-head{display:flex;justify-content:space-between;align-items:center;gap:8px;}
.snst-tk-outlet-name{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:12px;color:var(--navy);}
.snst-tk-outlet-link{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:10px;color:#fff;background:var(--pink);padding:3px 9px;border-radius:6px;text-decoration:none;}
.snst-tk-scopes{margin-top:5px;display:flex;flex-direction:column;gap:2px;}
.snst-tk-scopes p,.snst-tk-scope-line{margin:0;font-family:var(--snst-body),sans-serif;font-weight:500;font-size:11px;color:#5a6c8a;}
.snst-tk-scopes b{font-weight:800;color:var(--navy);}

/* ── グッズ ── */
.snst-goods-banner{position:relative;display:flex;align-items:center;justify-content:center;gap:9px;width:fit-content;margin:0 auto 20px;font-family:var(--snst-body),sans-serif;font-weight:800;letter-spacing:.04em;font-size:clamp(15px,3.5vw,21px);color:#fff;background:linear-gradient(100deg,#52e5f6,#009dff 60%,#4c32f0);border:3px solid var(--navy);border-radius:999px;padding:9px 26px;transform:rotate(-1deg);box-shadow:0 5px 0 rgba(54,16,105,.18),inset 0 2px 0 rgba(255,255,255,.5),inset 0 -3px 6px rgba(54,16,105,.18);}
.snst-goods-banner svg{color:var(--yellow);}
.snst-gallery-wrap{margin-bottom:16px;background:#fff;border:3px solid var(--navy);border-radius:16px;padding:14px;box-shadow:0 6px 0 rgba(54,16,105,.14);}
/* グッズ画像は 2カラム（2×2）に拡大。共有 ImageGallery の md:columns-4 を当ページだけ上書き。 */
.snst-gallery-wrap .columns-2{column-count:2;column-gap:12px;}
.snst-gallery-wrap .columns-2 > *{margin-bottom:12px;}
.snst-receive{margin-top:4px;display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:680px){ .snst-receive{grid-template-columns:1fr 1fr;} }
.snst-receive-item{background:#fff;border:2px solid rgba(54,16,105,.14);border-radius:14px;padding:14px 16px;}
.snst-receive-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;}
.snst-receive-method{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:14px;color:var(--navy);}
.snst-receive-link{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:11px;color:#d6437f;border:2px solid #ffd0e4;border-radius:8px;padding:3px 10px;text-decoration:none;}
.snst-receive-body p{margin:3px 0;font-family:var(--snst-body),sans-serif;font-weight:500;font-size:12px;color:#5a6c8a;white-space:pre-wrap;}
.snst-limited{margin-top:14px;display:flex;flex-direction:column;gap:12px;}
.snst-limited-item{background:#fff;border:2px solid rgba(54,16,105,.14);border-radius:14px;padding:14px 16px;}

/* ── FC・配信 ── */
.snst-fc-grid{display:grid;grid-template-columns:1fr;gap:16px;}
@media(min-width:680px){ .snst-fc-grid{grid-template-columns:1fr 1fr;} }
@media(min-width:980px){ .snst-fc-grid{grid-template-columns:repeat(3,1fr);} }
.snst-fc-imgs{display:flex;flex-direction:column;gap:8px;}
.snst-fc-img{width:100%;border-radius:10px;display:block;}
.snst-fc-info{font-family:var(--snst-body),sans-serif;font-weight:500;font-size:13px;color:#5a6c8a;display:flex;flex-direction:column;gap:10px;}
.snst-fc-info-block{display:flex;flex-direction:column;gap:3px;}
.snst-fc-info-title{margin:0;font-weight:800;font-size:14px;color:var(--navy);}
.snst-fc-info-note{font-size:11px;color:#7a89a3;white-space:pre-wrap;}
.snst-fc-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:2px;}
.snst-textlink{font-family:var(--snst-body),sans-serif;font-weight:800;font-size:12px;color:#d6437f;text-decoration:none;width:fit-content;}
.snst-textlink:hover{text-decoration:underline;}

/* ── フッター注記 ── */
.snst-foot-note{margin:0;text-align:center;font-family:var(--snst-body),sans-serif;font-weight:500;font-size:12px;color:rgba(54,16,105,.8);background:rgba(255,255,255,.6);border-radius:12px;padding:12px 16px;}
`
