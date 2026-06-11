"use client"

import { useState } from "react"
import type { Member } from "@/data/members"
import SafeImage from "@/components/common/SafeImage"
import MemberCardModal from "@/components/members/MemberCardModal"

/** メンバーの丸アイコン行。クリックでメンバーカードモーダルを開く。 */
export default function MemberIconRow({ members }: { members: Member[] }) {
  const [selected, setSelected] = useState<Member | null>(null)
  if (members.length === 0) return null

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelected(m)}
            aria-label={`${m.name} のカード`}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] transition-transform hover:scale-110"
            style={{ borderColor: m.color }}
          >
            <SafeImage
              src={m.icon}
              alt={m.name}
              width={64}
              height={64}
              fallbackLabel={m.nameEn}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
      {selected && <MemberCardModal member={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
