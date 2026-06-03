import { getLives } from "@/lib/repo"
import LiveCard from "./LiveCard"
import EmptyState from "@/components/common/EmptyState"

/** ライブ一覧（新しい順グリッド） */
export default async function LiveListView() {
  const lives = await getLives()

  if (lives.length === 0) {
    return <EmptyState label="ライブ情報を準備中です" />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {lives.map((live) => (
        <LiveCard key={live.slug} live={live} />
      ))}
    </div>
  )
}
