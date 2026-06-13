"use client"

import { useEffect } from "react"

/**
 * スクロールで各セクションをふわっと出現させる（fade-up）。
 * プログレッシブエンハンスメント：JS が動いて初めて root に .snst-anim-ready を付与し、
 * その時だけ CSS で初期非表示→出現。JS 無効時は常に表示されるので SSR/SEO に影響しない。
 */
export default function RevealOnScroll() {
  useEffect(() => {
    const root = document.querySelector(".snst-root")
    if (!root) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    root.classList.add("snst-anim-ready")
    const els = root.querySelectorAll<HTMLElement>(".snst-wrap > section, .snst-wrap > p")

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in")
            obs.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return null
}
