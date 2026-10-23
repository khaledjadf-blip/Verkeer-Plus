import Link from 'next/link'
import { logoutAction } from './actions'
import { adminText } from './text'
import type { Lang } from '@/types'

export const fieldClass = 'field-base'

export function AdminHeader({ lang, title, back }: { lang: Lang; title: React.ReactNode; back?: string }) {
  const a = adminText[lang]
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-soft">{a.kicker}</p>
        <h1 className="mt-1 font-display text-[clamp(24px,4vw,34px)] font-bold text-white">{title}</h1>
        {back && (
          <Link href={back} className="mt-2 inline-block text-[13px] font-semibold text-accent-soft underline underline-offset-4">
            {lang === 'ar' ? `${a.backToList} →` : `← ${a.backToList}`}
          </Link>
        )}
      </div>
      <form action={logoutAction}>
        <input type="hidden" name="lang" value={lang} />
        <button type="submit" className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim hover:text-white">{a.logout}</button>
      </form>
    </div>
  )
}

export function Notice({ lang, ok, fout }: { lang: Lang; ok?: string; fout?: string }) {
  if (fout) {
    return <p role="alert" className="mb-6 border-s-4 border-accent bg-accent/10 px-4 py-3 text-[14px] font-semibold text-accent-soft">{fout}</p>
  }
  const message = ok ? adminText[lang].ok[ok] : undefined
  if (message) {
    return <p role="status" className="mb-6 border-s-4 border-green-500 bg-green-500/10 px-4 py-3 text-[14px] font-semibold text-green-400">{message}</p>
  }
  return null
}
