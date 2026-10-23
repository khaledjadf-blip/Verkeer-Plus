'use client'

import Link from 'next/link'
import { useLang, useT } from '@/lib/langContext'
import { localizedHref } from '@/lib/localizedHref'
import { bookingText } from '@/data/bookingText'

export default function BecomeSteward() {
  const { lang } = useLang()
  const t = useT()

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1120px] px-6 md:px-12">
        <div className="grid gap-6 border border-concrete bg-card p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-soft">
              {lang === 'nl' ? '// Voor sollicitanten' : '// للمتقدمين'}
            </span>
            <h2 className="mt-3 font-display text-[clamp(24px,4vw,40px)] font-bold leading-[1.05] text-white">
              {t.bannerTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/82">
              {t.bannerBody}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:flex-col md:items-stretch">
            <Link href={localizedHref('/opleiding', lang)} className="btn-primary">
              {bookingText[lang].bannerCourseBtn} →
            </Link>
            <Link href={localizedHref('/werken-bij', lang)} className="btn-outline">
              {t.bannerBtn} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
