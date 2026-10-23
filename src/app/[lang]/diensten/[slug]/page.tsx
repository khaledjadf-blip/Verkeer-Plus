import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { services } from '@/data/content'
import ServiceContent from './ServiceContent'
import type { Lang } from '@/types'

export function generateStaticParams() {
  return services.flatMap(service => [
    { lang: 'nl', slug: service.id },
    { lang: 'ar', slug: service.id },
  ])
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lang = (await params).lang as Lang
  const service = services.find(s => s.id === slug)
  if (!service) return {}

  const svc = service[lang]
  const bare = `/diensten/${service.id}`
  const path = lang === 'ar' ? `/ar${bare}` : bare
  const suffix = lang === 'ar' ? '— فيركيرسبلوس' : '— Verkeersregelaars inhuren'

  return {
    title: `${svc.title} ${suffix}`,
    description: svc.description,
    openGraph: {
      title: `${svc.title} — Verkeersplus`,
      description: svc.description,
    },
    alternates: {
      canonical: path,
      languages: { 'nl-NL': bare, ar: `/ar${bare}` },
    },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = services.find(s => s.id === slug)
  if (!service) notFound()

  return (
    <>
      <Header />
      <main>
        <ServiceContent serviceId={service.id} />
      </main>
      <Footer />
    </>
  )
}
