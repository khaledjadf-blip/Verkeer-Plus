import Link from 'next/link'
import { bookingText } from '@/data/bookingText'
import { localizedHref } from '@/lib/localizedHref'
import type { PublicSession } from '@/lib/sessions'
import { formatDate, formatEuro, formatTimeRange } from '@/lib/time'
import type { Lang } from '@/types'

function Meta({ session, lang }: { session: PublicSession; lang: Lang }) {
  const b = bookingText[lang]
  return (
    <div className="grid gap-1.5 text-[14px] text-muted">
      <p className="font-display text-[18px] font-bold text-white">{formatDate(session.startsAt, lang)}</p>
      <p className="font-mono text-[13px] text-dim"><bdi dir="ltr">{formatTimeRange(session.startsAt, session.endsAt)}</bdi></p>
      <p><bdi>{session.location}</bdi></p>
      <p className="text-dim">{b.language}: <bdi>{session.language}</bdi></p>
      {session.details && <p className="whitespace-pre-line text-[13px] leading-relaxed text-dim"><bdi>{session.details}</bdi></p>}
    </div>
  )
}

export function SessionList({ sessions, lang }: { sessions: PublicSession[]; lang: Lang }) {
  const b = bookingText[lang]

  if (sessions.length === 0) {
    return (
      <div className="border border-concrete bg-card p-6">
        <p className="text-[15px] leading-relaxed text-muted">{b.noDates}</p>
        <Link href={localizedHref('/contact', lang)} className="btn-outline mt-5 inline-flex">
          {b.noDatesBtn} →
        </Link>
      </div>
    )
  }

  return (
    <ul className="grid gap-3">
      {sessions.map((s) => {
        const full = s.status === 'closed' || s.seatsLeft === 0
        return (
          <li key={s.id} className="grid gap-4 border border-concrete bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <Meta session={s} lang={lang} />
            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
              <span dir="ltr" className="font-display text-[26px] font-bold text-white">{formatEuro(s.priceCents)}</span>
              {full ? (
                <span className="border border-concrete px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-dim">{b.full}</span>
              ) : (
                <>
                  <span className={`font-mono text-[11px] uppercase tracking-[0.08em] ${s.seatsLeft <= 3 ? 'text-accent-soft' : 'text-green-400'}`}>
                    {b.seatsLeft(s.seatsLeft)}
                  </span>
                  <Link href={localizedHref(`/boeken/${s.id}`, lang)} className="btn-primary">
                    {b.bookBtn}
                  </Link>
                </>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function SessionSummary({ session, lang, title }: { session: PublicSession; lang: Lang; title: string }) {
  const b = bookingText[lang]
  const full = session.status === 'closed' || session.seatsLeft === 0
  return (
    <aside className="order-first grid gap-4 rounded-xl border border-concrete bg-raised p-6 lg:order-none">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-soft">{b.yourChoice}</p>
      <h2 className="font-display text-[20px] font-bold text-white">{title}</h2>
      <Meta session={session} lang={lang} />
      <div className="flex items-baseline justify-between border-t border-concrete pt-4">
        <span className="text-[13px] text-dim">{b.price}</span>
        <span dir="ltr" className="font-display text-[28px] font-bold text-white">{formatEuro(session.priceCents)}</span>
      </div>
      <p className="-mt-2 text-[12px] text-dim">{b.inclVat}</p>
      {!full && <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-green-400">{b.seatsLeft(session.seatsLeft)}</p>}
    </aside>
  )
}
