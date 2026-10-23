'use client'

import Link from 'next/link'
import { useLang, useT } from '@/lib/langContext'
import { localizedHref } from '@/lib/localizedHref'
import { services } from '@/data/content'

export default function Services() {
  const { lang } = useLang()
  const t = useT()

  return (
    <section id="diensten" className="relative overflow-hidden bg-bg py-20 sm:py-24">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />
      <div aria-hidden className="absolute right-[-12rem] top-12 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="max-w-[1120px] mx-auto px-6 md:px-12">
        <div className="mb-10 grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <span className="stripe" />
            <h2 className="font-display font-bold text-[clamp(28px,5vw,52px)] leading-[0.98] text-white">
              {t.servicesTitle}
            </h2>
          </div>
          <p className="max-w-xl text-[16px] leading-relaxed text-muted md:justify-self-end">
            {lang === 'nl'
              ? 'Drie duidelijke inzetlijnen: gepland werk, publieksstromen en directe calamiteitendekking. Geen vaag aanbod, maar snel de juiste ploeg op locatie.'
              : 'ثلاثة مسارات واضحة: أعمال مخططة، تدفق الجمهور، وتغطية طارئة مباشرة. عرض واضح وفريق مناسب في الموقع بسرعة.'}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {services.map((service) => {
            const svc = service[lang]
            return (
              <article key={service.id} className="vp-service-card group">
                <span className="block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_16px_rgba(212,25,27,0.8)]" />

                <h3 className="mt-7 font-display text-[clamp(22px,2vw,28px)] font-bold leading-[1.04] text-white hyphens-auto [overflow-wrap:break-word]">
                  {svc.title}
                </h3>
                <p className="mt-4 min-h-[8rem] text-[15px] leading-relaxed text-white/82">
                  {svc.description}
                </p>

                <ul className="mt-7 space-y-3">
                  {svc.features.map(feature => (
                    <li key={feature} className="flex gap-3 text-[14px] leading-6 text-white/84">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href={localizedHref(`/diensten/${service.id}`, lang)} className="font-mono text-[12px] uppercase tracking-[0.1em] text-white transition-colors hover:text-accent-soft">
                    {lang === 'nl' ? 'Bekijk route →' : 'عرض المسار ←'}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 border border-concrete bg-raised/70 p-4 sm:p-5">
          <p className="flex-1 text-[15px] leading-relaxed text-white/82">
            {lang === 'nl'
              ? 'Niet zeker welke inzet past? Stuur locatie, datum en situatie. Wij koppelen de juiste verkeersregelaars aan de opdracht.'
              : 'لست متأكداً من نوع الدعم المطلوب؟ أرسل الموقع والتاريخ والوضع، ونربطك بالفريق المناسب.'}
          </p>
          <a href={localizedHref('/contact', lang)} className="btn-primary">
            {t.contactBtn}
          </a>
        </div>
      </div>
    </section>
  )
}
