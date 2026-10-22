'use client'

import Link from 'next/link'
import { useT } from '@/lib/langContext'
import { localizedHref } from '@/lib/localizedHref'
import { contactInfo } from '@/data/content'
import { useLang } from '@/lib/langContext'

export default function ContactSnippet() {
  const t = useT()
  const { lang } = useLang()

  return (
    <section id="contact" className="relative overflow-hidden bg-bg py-20 sm:py-24">
      <div aria-hidden className="ghost-word">{lang === 'nl' ? '24/7' : '٢٤/٧'}</div>

      <div className="relative z-10 max-w-[1120px] mx-auto px-6 md:px-12">
        <span className="stripe" />
        <p className="eyebrow">{t.contactEyebrow}</p>

        <div className="grid gap-8 md:grid-cols-[1fr_0.9fr] md:items-start">
          <div>
            <h2 className="mb-4 font-display text-[clamp(30px,5vw,58px)] font-bold leading-[0.98] text-white">
              {t.contactTitle}
            </h2>
            <p className="mb-8 text-[16px] leading-relaxed text-white/82">
              {t.contactBody}
            </p>
            <Link href={localizedHref('/contact', lang)} className="btn-primary">
              {t.contactBtn}
            </Link>
          </div>

          <ul className="border border-concrete bg-raised/80 p-4 sm:p-5">
            {contactInfo.filter(row => row.href).map(row => {
              const r = row[lang]
              const inner = (
                <>
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">{r.label}</span>
                  <span className="text-end text-[15px] font-semibold text-accent-soft"><bdi dir="ltr">{r.value}</bdi></span>
                </>
              )
              return (
                <li key={row.key} className="flex justify-between items-baseline gap-4 border-b border-concrete py-4 last:border-none">
                  {row.href
                    ? <a href={row.href} className="contents hover:opacity-80 transition-opacity">{inner}</a>
                    : inner
                  }
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
