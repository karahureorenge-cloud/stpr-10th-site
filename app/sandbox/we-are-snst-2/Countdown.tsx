"use client"

import { useEffect, useState } from "react"

type Remaining = { days: number; hours: number; minutes: number; seconds: number }

function diff(target: number): Remaining {
  const now = Date.now()
  const ms = Math.max(0, target - now)
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

const UNITS: { key: keyof Remaining; label: string }[] = [
  { key: "days", label: "DAYS" },
  { key: "hours", label: "HOURS" },
  { key: "minutes", label: "MIN" },
  { key: "seconds", label: "SEC" },
]

/** ツアー初日までのカウントダウン。target は ISO 文字列（ダミー）。 */
export default function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime()
  // SSR とのハイドレーション不一致を避けるため、初期値は 0 埋め。
  const [r, setR] = useState<Remaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setR(diff(targetMs))
    const id = setInterval(() => setR(diff(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  return (
    <div className="snst-countdown" aria-label="ツアー初日までのカウントダウン">
      {UNITS.map((u, i) => (
        <div className="snst-cd-cell" key={u.key}>
          <div className="snst-cd-num">
            {mounted ? String(r[u.key]).padStart(2, "0") : "--"}
          </div>
          <div className="snst-cd-label">{u.label}</div>
          {i < UNITS.length - 1 && <span className="snst-cd-colon">:</span>}
        </div>
      ))}
    </div>
  )
}
