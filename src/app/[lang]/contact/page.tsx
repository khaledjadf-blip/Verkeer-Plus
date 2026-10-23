import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactContent from './ContactContent'
import type { Lang } from '@/types'

const content: Record<Lang, { title: string; description: string; ogDescription: string }> = {
  nl: {
    title: 'Contact — Verkeersplus Services',
    description: 'Neem contact op met Verkeersplus Services. Vrijblijvende offerte of direct bellen voor spoedklussen. Bereikbaar 24/7, landelijk actief.',
    ogDescription: 'Direct een team nodig? Bel of mail ons. 24/7 bereikbaar.',
  },
  ar: {
    title: 'تواصل معنا — فيركيرسبلوس سيرفيسز',
    description: 'تواصل مع فيركيرسبلوس سيرفيسز. عرض أسعار مجاني أو اتصل مباشرة للطلبات العاجلة. متاحون على مدار الساعة، على مستوى هولندا.',
    ogDescription: 'تحتاج فريقاً فوراً؟ اتصل بنا أو راسلنا. متاحون على مدار الساعة.',
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang
  const path = lang === 'ar' ? '/ar/contact' : '/contact'
  const c = content[lang]

  return {
    title: c.title,
    description: c.description,
    openGraph: { title: c.title, description: c.ogDescription },
    alternates: {
      canonical: path,
      languages: { 'nl-NL': '/contact', ar: '/ar/contact' },
    },
  }
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <ContactContent />
      </main>
      <Footer />
    </>
  )
}
