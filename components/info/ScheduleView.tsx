"use client"

import { useMemo, useState } from "react"
import { GROUPS, getGroupName, type GroupSlug } from "@/data/groups"
import {
  SCHEDULE_TYPES,
  scheduleTypeLabel,
  type ScheduleEvent,
  type ScheduleType,
} from "@/data/scheduleEvents"
import { IconCheck, IconChevronLeft, IconChevronRight, IconClose } from "./icons"

type View = "month" | "week" | "day"
type Cal = { y: number; m: number; d: number } // m: 1-12

const DOW = ["日", "月", "火", "水", "木", "金", "土"]
const pad = (n: number) => String(n).padStart(2, "0")
const keyOf = (c: Cal) => `${c.y}-${pad(c.m)}-${pad(c.d)}`
const dateKey = (iso: string) => iso.slice(0, 10)
const timeOf = (iso: string) => iso.slice(11, 16)
const toDate = (c: Cal) => new Date(c.y, c.m - 1, c.d)
const fromDate = (dt: Date): Cal => ({ y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() })
const addDays = (c: Cal, n: number) => fromDate(new Date(c.y, c.m - 1, c.d + n))
const addMonths = (c: Cal, n: number) => fromDate(new Date(c.y, c.m - 1 + n, 1))
const startOfWeek = (c: Cal) => addDays(c, -toDate(c).getDay())

function parseYmd(s: string): Cal {
  const [y, m, d] = s.split("-").map(Number)
  return { y, m, d }
}

export default function ScheduleView({ today, events }: { today: string; events: ScheduleEvent[] }) {
  const todayCal = parseYmd(today)
  const [cur, setCur] = useState<Cal>(todayCal)
  const [view, setView] = useState<View>("month")
  const [groups, setGroups] = useState<Set<GroupSlug>>(new Set(GROUPS.map((g) => g.slug)))
  const [types, setTypes] = useState<Set<ScheduleType>>(new Set(SCHEDULE_TYPES.map((t) => t.key)))
  const [modal, setModal] = useState<ScheduleEvent | null>(null)

  const visible = useMemo(
    () => events.filter((e) => groups.has(e.groupSlug) && types.has(e.type)),
    [events, groups, types],
  )
  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>()
    for (const e of visible) {
      const k = dateKey(e.start)
      const arr = map.get(k) ?? []
      arr.push(e)
      map.set(k, arr)
    }
    for (const arr of map.values()) arr.sort((a, b) => a.start.localeCompare(b.start))
    return map
  }, [visible])
  // ミニカレンダーのドットもフィルタ後（visible）に揃える（絞り込みと不一致にしない）。
  const eventDays = useMemo(() => new Set(visible.map((e) => dateKey(e.start))), [visible])

  const toggle = <T,>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    return next
  }

  const move = (dir: number) => {
    if (view === "month") setCur((c) => addMonths(c, dir))
    else if (view === "week") setCur((c) => addDays(c, dir * 7))
    else setCur((c) => addDays(c, dir))
  }

  const periodLabel = () => {
    if (view === "month") return `${cur.y}年${cur.m}月`
    if (view === "week") {
      const s = startOfWeek(cur)
      const e = addDays(s, 6)
      return `${s.m}/${s.d} - ${e.m}/${e.d}`
    }
    return `${cur.m}月${cur.d}日(${DOW[toDate(cur).getDay()]})`
  }

  // mini calendar / month grid cells（6週 42日）
  const monthCells = (anchor: Cal): Cal[] => {
    const first = { y: anchor.y, m: anchor.m, d: 1 }
    const start = addDays(first, -toDate(first).getDay())
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  }

  return (
    <div className="page">
      <div className="schedule-layout">
        {/* ===== Sidebar ===== */}
        <aside className="schedule-sidebar">
          {/* Mini calendar */}
          <div className="mini-calendar">
            <div className="mini-cal-header">
              <button type="button" className="mini-cal-nav" onClick={() => setCur((c) => addMonths(c, -1))} aria-label="前の月">
                <IconChevronLeft />
              </button>
              <span className="mini-cal-month">{cur.y}年{cur.m}月</span>
              <button type="button" className="mini-cal-nav" onClick={() => setCur((c) => addMonths(c, 1))} aria-label="次の月">
                <IconChevronRight />
              </button>
            </div>
            <div className="mini-cal-grid">
              {DOW.map((d, i) => (
                <div key={d} className={`mini-cal-dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>{d}</div>
              ))}
              {monthCells(cur).map((c) => {
                const k = keyOf(c)
                const dow = toDate(c).getDay()
                const cls = [
                  "mini-cal-day",
                  c.m !== cur.m ? "other-month" : "",
                  k === today ? "today" : "",
                  dow === 0 ? "sun" : dow === 6 ? "sat" : "",
                  eventDays.has(k) ? "has-event" : "",
                ].filter(Boolean).join(" ")
                return (
                  <button key={k} type="button" className={cls} onClick={() => { setCur(c); setView("day") }}>
                    {c.d}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Group filter */}
          <div>
            <div className="sidebar-title">グループで絞り込み</div>
            <div className="filter-section">
              {GROUPS.map((g) => {
                const on = groups.has(g.slug)
                return (
                  <button key={g.slug} type="button" className="filter-checkbox" onClick={() => setGroups((s) => toggle(s, g.slug))}>
                    <span className={`check-box ${on ? "on" : "off"}`} style={on ? { background: g.themeColor, borderColor: g.themeColor } : undefined}>
                      {on && <IconCheck />}
                    </span>
                    <span className="check-label">{g.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Type filter */}
          <div>
            <div className="sidebar-title">内容で絞り込み</div>
            <div className="filter-section">
              {SCHEDULE_TYPES.map((t) => {
                const on = types.has(t.key)
                return (
                  <button key={t.key} type="button" className="filter-checkbox" onClick={() => setTypes((s) => toggle(s, t.key))}>
                    <span className={`check-box ${on ? "on" : "off"}`}>{on && <IconCheck />}</span>
                    <span className="check-label">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* ===== Main ===== */}
        <main className="schedule-main">
          <div className="schedule-toolbar">
            <div className="view-tabs">
              {(["month", "week", "day"] as View[]).map((v) => (
                <button key={v} type="button" className={`view-tab ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
                  {v === "month" ? "月" : v === "week" ? "週" : "日"}
                </button>
              ))}
            </div>
            <button type="button" className="today-btn" onClick={() => setCur(todayCal)}>今日</button>
            <span className="current-period">{periodLabel()}</span>
            <div className="nav-btns">
              <button type="button" className="nav-btn" onClick={() => move(-1)} aria-label="前へ"><IconChevronLeft /></button>
              <button type="button" className="nav-btn" onClick={() => move(1)} aria-label="次へ"><IconChevronRight /></button>
            </div>
          </div>

          {view === "month" && (
            <div className="month-grid">
              <div className="month-dow-header">
                {DOW.map((d, i) => (
                  <div key={d} className={`month-dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>{d}</div>
                ))}
              </div>
              <div className="month-days">
                {monthCells(cur).map((c) => {
                  const k = keyOf(c)
                  const dow = toDate(c).getDay()
                  const dayEvents = byDate.get(k) ?? []
                  const cls = [
                    "month-day",
                    c.m !== cur.m ? "other" : "",
                    k === today ? "today" : "",
                    dow === 0 ? "sun" : dow === 6 ? "sat" : "",
                  ].filter(Boolean).join(" ")
                  return (
                    <div key={k} className={cls}>
                      <div className="month-day-num">{c.d}</div>
                      {dayEvents.slice(0, 3).map((e) => (
                        <button key={e.id} type="button" className={`event-chip chip-${e.type}`} onClick={() => setModal(e)} title={e.title}>
                          {timeOf(e.start)} {e.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <button type="button" className="event-chip" style={{ background: "#eef2f7", color: "#666" }} onClick={() => { setCur(c); setView("day") }}>
                          ほか{dayEvents.length - 3}件
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(view === "week" || view === "day") && (
            <div className="week-view">
              {(view === "week"
                ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cur), i))
                : [cur]
              ).map((c) => {
                const k = keyOf(c)
                const dayEvents = byDate.get(k) ?? []
                const isToday = k === today
                return (
                  <div key={k} className="week-day-row">
                    <div className="week-day-header">
                      <span className={`week-date ${isToday ? "today" : ""}`}>
                        {c.m}/{c.d}（{DOW[toDate(c).getDay()]}）
                      </span>
                      {isToday && <span className="today-chip">TODAY</span>}
                    </div>
                    {dayEvents.length === 0 ? (
                      <div className="no-event">予定はありません</div>
                    ) : (
                      <div className="week-events">
                        {dayEvents.map((e) => (
                          <button key={e.id} type="button" className={`week-event-item chip-${e.type}`} onClick={() => setModal(e)}>
                            <span className="event-time">{timeOf(e.start)}</span>
                            <span className="event-info">
                              <span className="event-name">{e.title}</span>
                              <span className="event-sub">{scheduleTypeLabel(e.type)}{e.venue ? ` ・ ${e.venue}` : ""}</span>
                            </span>
                            <span className="event-group-tag">{getGroupName(e.groupSlug)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* ===== Event Modal ===== */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <button type="button" className="modal-close" onClick={() => setModal(null)} aria-label="閉じる">
              <IconClose />
            </button>
            <div className="modal-body">
              <div className="modal-meta">
                <span className={`event-chip chip-${modal.type}`} style={{ width: "auto" }}>{scheduleTypeLabel(modal.type)}</span>
                <span className="group-badge">{getGroupName(modal.groupSlug)}</span>
              </div>
              <h2 className="modal-title" style={{ fontSize: 20 }}>{modal.title}</h2>
              <div className="modal-content">
                {`日時：${dateKey(modal.start)} ${timeOf(modal.start)}${modal.end ? ` 〜 ${timeOf(modal.end)}` : ""}`}
                {modal.venue ? `\n会場：${modal.venue}` : ""}
                {modal.note ? `\n${modal.note}` : ""}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
