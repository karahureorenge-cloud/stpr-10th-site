/** サイトフッター。控えめなゴールドの区切り線と著作表記。 */
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gold-200/60 bg-white/40 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-12 text-center">
        <p className="gold-shimmer font-display text-lg tracking-[0.3em]">
          10TH ANNIVERSARY
        </p>
        <p className="mt-3 font-serif text-sm text-[#6a5570]">
          【非公式】すとぷり 10周年特設サイト
        </p>
        <p className="mt-6 text-[11px] tracking-wider text-[#9a8aa0]">
          © STPR非公式ファンサイト
        </p>
      </div>
    </footer>
  )
}
