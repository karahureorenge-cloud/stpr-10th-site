"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { GROUPS, getGroupName, type GroupSlug } from "@/data/groups"
import {
  NEWS_CATEGORIES,
  newsCategoryLabel,
  type NewsCategory,
  type NewsPost,
} from "@/data/newsPosts"
import { IconClose } from "./icons"

const ACCENT = "#005397"

function fmtDateTime(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso)
  if (!m) return iso
  return `${m[1]}/${m[2]}/${m[3]} ${m[4]}:${m[5]}`
}
function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? `${m[1]}/${m[2]}/${m[3]}` : iso
}

export default function NewsView({ posts }: { posts: NewsPost[] }) {
  const [group, setGroup] = useState<GroupSlug | "all">("all")
  const [cat, setCat] = useState<NewsCategory | "all">("all")
  const [modal, setModal] = useState<NewsPost | null>(null)

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of posts) counts[p.groupSlug] = (counts[p.groupSlug] ?? 0) + 1
    return counts
  }, [posts])

  const filtered = useMemo(
    () =>
      posts.filter(
        (p) => (group === "all" || p.groupSlug === group) && (cat === "all" || p.category === cat),
      ),
    [posts, group, cat],
  )

  // 速報もグループ/カテゴリ絞り込みに追従（フィーチャー/一覧と整合）。
  const breaking = filtered.filter((p) => p.isBreaking).slice(0, 4)
  const featured = filtered.find((p) => p.isFeatured) ?? filtered[0]
  const rest = filtered.filter((p) => p.id !== featured?.id)

  return (
    <div className="page">
      <div className="news-layout">
        {/* ===== Sidebar ===== */}
        <aside className="news-sidebar">
          {breaking.length > 0 && (
            <div>
              <div className="sidebar-title">速報</div>
              <div className="sokuhoh-list">
                {breaking.map((p) => (
                  <button key={p.id} type="button" className="sokuhoh-item" onClick={() => setModal(p)}>
                    <span className="sokuhoh-badge">速報</span>
                    <span className="sokuhoh-text">{p.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="sidebar-title">グループ</div>
            <div className="group-filter">
              <button type="button" className={`filter-item ${group === "all" ? "active" : ""}`} onClick={() => setGroup("all")}>
                <span className="filter-dot" style={{ background: ACCENT }} />
                すべて
                <span className="filter-count">{posts.length}</span>
              </button>
              {GROUPS.map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  className={`filter-item ${group === g.slug ? "active" : ""}`}
                  onClick={() => setGroup(g.slug)}
                >
                  <span className="filter-dot" style={{ background: g.themeColor }} />
                  {g.name}
                  <span className="filter-count">{groupCounts[g.slug] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="sidebar-title">カテゴリ</div>
            <div className="category-tags">
              <button type="button" className={`cat-tag ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>
                すべて
              </button>
              {NEWS_CATEGORIES.map((c) => (
                <button key={c.key} type="button" className={`cat-tag ${cat === c.key ? "active" : ""}`} onClick={() => setCat(c.key)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ===== Main ===== */}
        <main className="news-main">
          {featured && (
            <Link href={`/news/${featured.id}`} className="featured-article">
              <div className="featured-img">
                {featured.thumbnail && <img src={featured.thumbnail} alt="" />}
              </div>
              <div className="featured-body">
                <div>
                  <div className="featured-meta">
                    <span className="article-cat">{newsCategoryLabel(featured.category)}</span>
                    <span className="article-date">{fmtDateTime(featured.publishedAt)}</span>
                  </div>
                  <h2 className="featured-title">{featured.title}</h2>
                  <p className="featured-desc">{featured.excerpt}</p>
                </div>
                <div className="featured-group">
                  <span className="group-badge">{getGroupName(featured.groupSlug)}</span>
                </div>
              </div>
            </Link>
          )}

          <div className="articles-header">
            <span className="articles-label">最新ニュース</span>
          </div>
          <div className="articles-grid">
            {rest.length === 0 && !featured && <p className="empty-note">該当するニュースはありません。</p>}
            {rest.map((p, i) => (
              <Link key={p.id} href={`/news/${p.id}`} className="article-card">
                <div className={`article-thumb ${i % 2 === 1 ? "pink" : ""}`}>
                  {p.thumbnail && <img src={p.thumbnail} alt="" />}
                </div>
                <div className="article-body">
                  <div className="featured-meta">
                    <span className="article-cat">{newsCategoryLabel(p.category)}</span>
                    <span className="article-date">{fmtDate(p.publishedAt)}</span>
                  </div>
                  <div className="article-title">{p.title}</div>
                  <div className="article-footer">
                    <span className="group-badge">{getGroupName(p.groupSlug)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

      {/* ===== 速報モーダル ===== */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setModal(null)} aria-label="閉じる">
              <IconClose />
            </button>
            <div className={`modal-img ${modal.category === "goods" ? "pink" : ""}`}>
              {modal.thumbnail && <img src={modal.thumbnail} alt="" />}
            </div>
            <div className="modal-body">
              <div className="modal-meta">
                <span className="article-cat">{newsCategoryLabel(modal.category)}</span>
                <span className="article-date">{fmtDateTime(modal.publishedAt)}</span>
                <span className="group-badge">{getGroupName(modal.groupSlug)}</span>
              </div>
              <h2 className="modal-title">{modal.title}</h2>
              <div className="modal-author">
                <span className="author-icon">S</span>
                <span className="author-name">{modal.author ?? "STPR運営"}</span>
              </div>
              {modal.spoiler && <div className="modal-spoiler">※ ネタバレを含みます。閲覧にご注意ください。</div>}
              <div className="modal-content">{modal.body}</div>
              <Link href={`/news/${modal.id}`} className="modal-detail-link">
                記事全文を見る →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
