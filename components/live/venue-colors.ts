// 会場ピン/ドットの配色。日本地図（JapanVenueMap）と公演情報（VenueBlock）で共有する。
// ※ "use client" を付けない普通のモジュールにすることで、サーバーコンポーネントから
//    importしても実値（配列）が渡る（client境界のプロキシ化を避ける）。
export const VENUE_COLORS = [
  "#c084fc",
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
]
