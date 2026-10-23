'use client'

import Link from 'next/link'
import { useLang, useT } from '@/lib/langContext'
import { localizedHref } from '@/lib/localizedHref'
import { siteConfig } from '@/data/content'

export default function Footer() {
  const { lang } = useLang()
  const t = useT()

  return (
    <footer className="border-t border-concrete">
      <div className="max-w-[1120px] mx-auto px-6 md:px-12 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-start">
          <p className="font-mono text-[11px] text-dim" dir="ltr">© {new Date().getFullYear()} {siteConfig.legalName}</p>
          <p className="mt-1 font-mono text-[11px] text-dim" dir="ltr">
            KvK {siteConfig.kvk} · {lang === 'nl' ? 'btw' : 'VAT'} {siteConfig.btw}
          </p>
        </div>
        <div className="flex items-center gap-5 flex-wrap justify-center">
          <Link href={localizedHref('/', lang)} className="font-mono text-[11px] text-dim hover:text-accent transition-colors">
            {lang === 'nl' ? 'Home' : 'الرئيسية'}
          </Link>
          <Link href={localizedHref('/opleiding', lang)} className="font-mono text-[11px] text-dim hover:text-accent transition-colors">
            {lang === 'nl' ? 'Opleiding' : 'الدورة'}
          </Link>
          <Link href={localizedHref('/werken-bij', lang)} className="font-mono text-[11px] text-dim hover:text-accent transition-colors">
            {lang === 'nl' ? 'Werken bij' : 'العمل معنا'}
          </Link>
          <Link href={localizedHref('/contact', lang)} className="font-mono text-[11px] text-dim hover:text-accent transition-colors">
            {lang === 'nl' ? 'Contact' : 'تواصل معنا'}
          </Link>
          <Link href={localizedHref('/privacy', lang)} className="font-mono text-[11px] text-dim hover:text-accent transition-colors">
            {t.privacy}
          </Link>
          <Link href={localizedHref('/voorwaarden', lang)} className="font-mono text-[11px] text-dim hover:text-accent transition-colors">
            {t.terms}
          </Link>
          <span className="font-mono text-[11px] text-dim">
            {siteConfig.group}
          </span>
        </div>
      </div>
    </footer>
  )
}
