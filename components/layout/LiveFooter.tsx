const ABOUT_HREF = "https://www.stprinformalfansite.com/siteoverview"

/** 公開 /live ページ専用フッター。当サイトについてボタン＋著作表記。 */
export default function LiveFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-10 text-center lg:px-8">
        <a
          href={ABOUT_HREF}
          className="inline-block rounded-full bg-[#1a347e] px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#142a66]"
        >
          当サイトについて
        </a>
        <p className="mt-5 text-xs font-bold text-[#1a347e]">© 2026 STPR非公式ファンサイト</p>
      </div>
    </footer>
  )
}
