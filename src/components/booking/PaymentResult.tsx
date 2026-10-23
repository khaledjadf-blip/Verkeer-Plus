'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { bookingText } from '@/data/bookingText'
import { siteConfig } from '@/data/content'
import { useLang } from '@/lib/langContext'
import { localizedHref } from '@/lib/localizedHref'

type Result = { status: string; sessionId?: string }

const MAX_CHECKS = 40 // ± 2 minutes

function Card({ children, role = 'status' }: { children: React.ReactNode; role?: string }) {
  return <div role={role} className="rounded-xl border border-concrete bg-raised p-7 md:p-9">{children}</div>
}

export default function PaymentResult({ bookingId }: { bookingId: string }) {
  const { lang } = useLang()
  const b = bookingText[lang]
  const [result, setResult] = useState<Result | null>(null)
  const [checks, setChecks] = useState(0)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    let count = 0

    async function check() {
      count += 1
      try {
        const res = await fetch(`/api/bookings/${bookingId}/status`, { cache: 'no-store' })
        const body: Result = await res.json()
        if (cancelled) return
        setResult(body)
        setChecks(count)
        if (body.status === 'pending' && count < MAX_CHECKS) timer = setTimeout(check, 3000)
      } catch {
        if (!cancelled && count < MAX_CHECKS) timer = setTimeout(check, 3000)
      }
    }
    check()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [bookingId])

  const status = result?.status
  const title = 'font-display text-[clamp(24px,4vw,34px)] font-bold leading-tight text-white'
  const body = 'mt-3 text-[15px] leading-relaxed text-muted'
  const phone = <a href={`tel:${siteConfig.phoneTel}`} dir="ltr" className="font-bold text-accent-soft hover:underline">{siteConfig.phone}</a>

  if (!result || (status === 'pending' && checks < MAX_CHECKS)) {
    return (
      <Card>
        <h1 className={title}>{b.checkingTitle}</h1>
        <p className={body}>{b.checkingBody}</p>
      </Card>
    )
  }

  if (status === 'paid') {
    return (
      <Card>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-green-400">● {b.paidEyebrow}</p>
        <h1 className={`mt-3 ${title}`}>{b.paidTitle}</h1>
        <p className={body}>{b.paidBody}</p>
        <Link href={localizedHref('/', lang)} className="btn-outline mt-6 inline-flex">{b.backHome}</Link>
      </Card>
    )
  }

  if (status === 'pending') {
    return (
      <Card>
        <h1 className={title}>{b.pendingTitle}</h1>
        <p className={body}>{b.pendingBody} {phone}</p>
      </Card>
    )
  }

  return (
    <Card role="alert">
      <h1 className={title}>{b.failedTitle}</h1>
      <p className={body}>{b.failedBody}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {result.sessionId && (
          <Link href={localizedHref(`/boeken/${result.sessionId}`, lang)} className="btn-primary">{b.retry}</Link>
        )}
        <Link href={localizedHref('/opleiding', lang)} className="btn-outline">{b.otherDates}</Link>
      </div>
    </Card>
  )
}
