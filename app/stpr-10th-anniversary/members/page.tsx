import PageContainer from "@/components/common/PageContainer"
import MemberCard from "@/components/members/MemberCard"
import { MEMBERS } from "@/data/members"

export const metadata = {
  title: "メンバー",
  description: "すとぷり 10周年のメンバー紹介。",
}

export default function MembersPage() {
  return (
    <PageContainer subtitle="MEMBERS" title="メンバー">
      {/* SP 2列 / sm 3列 / PC 6列（既存ファンサイト準拠） */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-6">
        {MEMBERS.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>
    </PageContainer>
  )
}
