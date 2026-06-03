"use client"

import { useState } from "react"
import type { Song } from "@/data/songs"
import SongCard from "./SongCard"
import EmptyState from "@/components/common/EmptyState"

type Tab = "ALL" | "ORIGINAL" | "COVER"
const TABS: Tab[] = ["ALL", "ORIGINAL", "COVER"]

/** ミュージック一覧（ALL / ORIGINAL / COVER タブ） */
export default function MusicListView({ songs }: { songs: Song[] }) {
  const [tab, setTab] = useState<Tab>("ALL")

  if (songs.length === 0) {
    return <EmptyState label="楽曲情報を準備中です" />
  }

  const filtered =
    tab === "ALL"
      ? songs
      : songs.filter((s) => s.type === tab.toLowerCase())

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 font-display text-xs tracking-[0.15em] transition-colors ${
              tab === t
                ? "border-gold-400 bg-gold-400 text-white"
                : "border-gold-200 bg-white/60 text-[#6a5570] hover:border-gold-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((song) => (
          <SongCard key={song.slug} song={song} />
        ))}
      </div>
    </div>
  )
}
