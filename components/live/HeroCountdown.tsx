"use client"

import { useEffect, useState } from "react"

type Parts = { d: number; h: number; m: number; s: number } | null

function diffParts(targetMs: number): Parts {
  const diff = targetMs - Date.now()
  if (diff <= 0) return null
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

const pad = (n: number) => String(n).padStart(2, "0")

/** 開催までのライブカウントダウン（日:時間:分:秒）。開始が未来のときだけ表示。 */
export default function HeroCountdown({ target }: { target?: string }) {
  const targetMs = target ? new Date(target.replace(" ", "T")).getTime() : NaN
  const [parts, setParts] = useState<Parts>(() =>
    Number.isFinite(targetMs) ? diffParts(targetMs) : null,
  )

  useEffect(() => {
    if (!Number.isFinite(targetMs)) return
    setParts(diffParts(targetMs))
    const id = setInterval(() => setParts(diffParts(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  if (!parts) return null

  const units: Array<[number, string]> = [
    [parts.d, "日"],
    [parts.h, "時間"],
    [parts.m, "分"],
    [parts.s, "秒"],
  ]

  return (
    <div className="flex min-w-[200px] flex-col items-center gap-2 rounded-xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
      <span className="text-[10px] tracking-[0.15em] text-white/50">開催まであと</span>
      <div className="flex items-center gap-2">
        {units.map(([n, label], i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <span className="pb-3 text-2xl text-white/30">:</span>}
            <div className="flex flex-col items-center gap-0.5">
              <span className="min-w-[2ch] text-center text-3xl font-extrabold leading-none text-white tabular-nums">
                {label === "日" ? n : pad(n)}
              </span>
              <span className="text-[10px] text-white/50">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
