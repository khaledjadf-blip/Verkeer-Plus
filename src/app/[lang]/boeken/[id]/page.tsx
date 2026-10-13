import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BookingForm from '@/components/booking/BookingForm'
import { SessionSummary } from '@/components/booking/SessionList'
import { bookingText } from '@/data/bookingText'
import { course } from '@/data/course'
import { localizedHref } from '@/lib/localizedHref'
import { getPublicSession } from '@/lib/sessions'
import type { Lang } from '@/types'

// Seats left must always be current.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Boeken',
  robots: { index: false, follow: true },
}

export default async function BookingPage({ params }: { params: { lang: Lang; id: string } }) {
  const { lang, id } = params
  const session = await getPublicSession(id)
  if (!session) notFound()
  const b = bookingText[lang]
  const title = course[lang].title
  const bookable = session.status === 'open' && session.seatsLeft > 0 && new Date(session.startsAt) > new Date()

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-concrete pb-10">
          <div className="mx-auto max-w-[1120px] px-6 pt-14 md:px-12">
            <span className="stripe" />
            <p className="eyebrow">{b.bookingEyebrow}</p>
            <h1 className="font-display text-[clamp(26px,4.5vw,42px)] font-bold leading-[1.12] text-white">{title}</h1>
            <Link href={localizedHref('/opleiding', lang)} className="mt-4 inline-block font-mono text-[12px] uppercase tracking-[0.08em] text-accent-soft hover:underline">
              {b.otherDate}
            </Link>
          </div>
        </section>

        <section className="py-12 pb-24">
          <div className="mx-auto grid max-w-[1120px] gap-8 px-6 md:px-12 lg:grid-cols-[1fr_360px] lg:items-start">
            {bookable ? (
              <BookingForm sessionId={session.id} />
            ) : (
              <div className="rounded-xl border border-concrete bg-raised p-7">
                <h2 className="font-display text-[22px] font-bold text-white">{b.fullTitle}</h2>
                <p className="mt-3 text-[15px] text-muted">{b.fullBody}</p>
                <Link href={localizedHref('/opleiding', lang)} className="btn-primary mt-6">{b.fullBtn}</Link>
              </div>
            )}
            <SessionSummary session={session} lang={lang} title={title} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
