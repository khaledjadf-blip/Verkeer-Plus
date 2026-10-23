import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WerkenBijContent from './WerkenBijContent'
import type { Lang } from '@/types'

const content: Record<Lang, { title: string; description: string; ogDescription: string }> = {
  nl: {
    title: 'Werken bij Verkeersplus — Word verkeersregelaar',
    description: 'Solliciteer als verkeersregelaar bij Verkeersplus Services. Met of zonder ervaring welkom. Goede verdiensten, flexibele inzet, landelijk actief.',
    ogDescription: 'Word verkeersregelaar. Met of zonder ervaring, landelijk actief.',
  },
  ar: {
    title: 'العمل لدى فيركيرسبلوس — كن منظم حركة مرور',
    description: 'قدّم كمنظم حركة مرور لدى فيركيرسبلوس سيرفيسز. مرحب بك بخبرة أو بدونها. أجر جيد، عمل مرن، على مستوى هولندا.',
    ogDescription: 'كن منظم حركة مرور. بخبرة أو بدونها، على مستوى هولندا.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang
  const path = lang === 'ar' ? '/ar/werken-bij' : '/werken-bij'
  const c = content[lang]

  return {
    title: c.title,
    description: c.description,
    openGraph: { title: c.title, description: c.ogDescription },
    alternates: {
      canonical: path,
      languages: { 'nl-NL': '/werken-bij', ar: '/ar/werken-bij' },
    },
  }
}

export default function WerkenBijPage() {
  return (
    <>
      <Header />
      <main>
        <WerkenBijContent />
      </main>
      <Footer />
    </>
  )
}
