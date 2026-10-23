import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SessionList } from '@/components/booking/SessionList'
import { bookingText } from '@/data/bookingText'
import { course } from '@/data/course'
import { getUpcomingSessions } from '@/lib/sessions'
import type { Lang } from '@/types'

// Seats left must always be current.
export const dynamic = 'force-dynamic'

const meta: Record<Lang, { title: string; description: string }> = {
  nl: {
    title: 'Opleiding Beroepsverkeersregelaar — data & online boeken',
    description: 'Word beroepsverkeersregelaar via Verkeersplus. Bekijk de komende data, boek je plek en betaal direct online met iDEAL of creditcard.',
  },
  ar: {
    title: 'دورة منظم حركة مرور محترف — المواعيد والحجز',
    description: 'اصبح منظم حركة مرور محترفاً عبر فيركيرسبلوس. اطلع على المواعيد القادمة، احجز مقعدك وادفع مباشرة عبر الإنترنت.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang
  return {
    title: meta[lang].title,
    description: meta[lang].description,
    openGraph: { title: meta[lang].title, description: meta[lang].description },
    alternates: {
      canonical: lang === 'ar' ? '/ar/opleiding' : '/opleiding',
      languages: { 'nl-NL': '/opleiding', ar: '/ar/opleiding' },
    },
  }
}

export default async function CoursePage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang
  const c = course[lang]
  const b = bookingText[lang]
  const sessions = await getUpcomingSessions()

  return (
    <>
      <Header />
      <main>
        <section className="border-b border-concrete pb-12">
          <div className="mx-auto max-w-[1120px] px-6 pt-16 md:px-12">
            <span className="stripe" />
            <p className="eyebrow">{c.eyebrow}</p>
            <h1 className="mb-5 font-display text-[clamp(28px,5vw,46px)] font-bold leading-[1.12] text-white">{c.title}</h1>
            <p className="max-w-[640px] text-[17px] leading-relaxed text-muted">{c.intro}</p>
          </div>
        </section>

        <section className="py-14 pb-24">
          <div className="mx-auto grid max-w-[1120px] gap-10 px-6 md:px-12 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-soft">{b.datesEyebrow}</p>
              <h2 id="data" className="mb-6 mt-2 scroll-mt-24 font-display text-[clamp(22px,3vw,30px)] font-bold text-white">{b.datesTitle}</h2>
              <SessionList sessions={sessions} lang={lang} />
            </div>

            <aside className="grid gap-6">
              <div className="rounded-xl border border-concrete bg-raised p-6">
                <ul className="space-y-3.5">
                  {c.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      <span className="text-[14px] leading-snug text-muted">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-concrete bg-raised p-6">
                <h3 className="mb-4 font-display text-[16px] font-bold text-white">{c.requirementsTitle}</h3>
                <ul className="space-y-3.5">
                  {c.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      <span className="text-[14px] leading-snug text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
