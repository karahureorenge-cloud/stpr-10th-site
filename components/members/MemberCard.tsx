"use client"

import { useState } from "react"
import type { CSSProperties } from "react"
import { Italianno } from "next/font/google"
import type { Member } from "@/data/members"
import { MiniHeart } from "@/components/group/strawberry-prince/StrawberryDecorations"
import SafeImage from "@/components/common/SafeImage"
import MemberCardModal from "./MemberCardModal"
import "@/components/group/strawberry-prince/strawberry-prince.css"

const italianno = Italianno({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
})

/* メンバーカラーの RGB（rgba() で透過合成用）— 既存ファンサイトからそのまま移植 */
const MEMBER_RGB: Record<string, string> = {
  rinu: "232, 122, 122",
  root: "168, 149, 204",
  jel: "142, 200, 224",
  satomi: "232, 200, 120",
  colon: "232, 160, 188",
  nanamori: "232, 168, 136",
}

/**
 * メンバーカード（既存ファンサイト すとぷりグループページから完全移植）。
 * - HTML/CSS/クラス名・アニメーション・スタイルはそのまま（sp-member-card 系）。
 * - データソースのみ data/members.ts に差し替え（画像は visual10th）。
 * - 10周年独自：Link 遷移の代わりにタップで拡大モーダル（FLIP でミニキャラ）。
 */
export default function MemberCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false)
  const rgb = MEMBER_RGB[member.id] ?? "220, 180, 200"

  return (
    <div className="theme-strawberry">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${member.name} のカードを開く`}
        className="sp-member-card relative block group p-1 sm:p-3 w-full text-left"
        style={
          {
            ["--sp-m-rgb" as string]: rgb,
          } as CSSProperties
        }
      >
        {/* 内側をアクキー風（厚みのある透明層） */}
        <div className="sp-acrylic p-1 sm:p-3">
          {/* カード表面：アイコン画像（正方形・丸角）。SP は小さく中央寄せ。 */}
          <div className="relative mx-auto aspect-square w-3/4 overflow-hidden rounded bg-white/40 sm:w-full">
            <SafeImage
              src={member.icon}
              alt={`${member.name} アイコン`}
              fill
              fallbackLabel={member.nameEn}
              sizes="(max-width: 768px) 45vw, 160px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="text-center mt-2">
            <p
              className="whitespace-nowrap font-bold text-[11px] leading-tight sm:text-sm"
              style={{ color: "var(--sp-text)" }}
            >
              {member.name}
            </p>
            {member.nameEn && (
              <p
                className={`${italianno.className} whitespace-nowrap text-sm sm:text-xl`}
                style={{
                  color: "var(--sp-text-accent)",
                  opacity: 0.75,
                  lineHeight: 1.1,
                }}
              >
                {member.nameEn}
              </p>
            )}
            <div className="sp-member-rule" />
          </div>
        </div>
        {/* 右上にメンバーイニシャル入りホロバッジ */}
        <span
          aria-hidden
          className="sp-holo-badge sp-holo-badge--member"
          style={{ top: 6, right: 6, width: 26, height: 26 }}
        >
          <span
            className={italianno.className}
            style={{
              fontSize: 16,
              color: "rgba(58, 37, 64, 0.75)",
              lineHeight: 1,
            }}
          >
            {member.nameEn?.[0] ?? member.name[0]}
          </span>
        </span>
        {/* 右下にメンバーカラーのミニハート */}
        <span className="sp-member-heart">
          <MiniHeart size={14} color={`rgba(${rgb}, 0.85)`} />
        </span>
      </button>

      {open && <MemberCardModal member={member} onClose={() => setOpen(false)} />}
    </div>
  )
}
