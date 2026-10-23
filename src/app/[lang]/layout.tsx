import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Space_Mono, Noto_Sans_Arabic } from 'next/font/google'
import { LangProvider } from '@/lib/langContext'
import { siteConfig } from '@/data/content'
import type { Lang } from '@/types'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

export function generateStaticParams() {
  return [{ lang: 'nl' }, { lang: 'ar' }]
}

const titles: Record<Lang, string> = {
  nl: 'Verkeersplus — Verkeersregelaars inhuren, 24 uur geregeld',
  ar: 'فيركيرسبلوس — توظيف منظمي حركة مرور خلال 24 ساعة',
}
const descriptions: Record<Lang, string> = {
  nl: 'Gecertificeerde verkeersregelaars inhuren voor wegwerkzaamheden, evenementen en calamiteiten. Verkeersplus Services — landelijke dekking, 24/7 bereikbaar.',
  ar: 'توظيف منظمي حركة مرور معتمدين لأعمال الطرق والفعاليات والطوارئ. فيركيرسبلوس سيرفيسز — تغطية على مستوى هولندا، متاحون على مدار الساعة.',
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang
  const path = lang === 'ar' ? '/ar' : '/'

  return {
    title: {
      default: titles[lang],
      template: `%s | Verkeersplus`,
    },
    description: descriptions[lang],
    keywords: ['verkeersregelaars', 'wegwerkzaamheden', 'CROW', 'verkeersbegeleiding', 'Nederland', 'inhuren'],
    authors: [{ name: 'Verkeersplus Services B.V.' }],
    creator: 'Verkeersplus',
    metadataBase: new URL(siteConfig.baseUrl),
    alternates: {
      canonical: path,
      languages: { 'nl-NL': '/', ar: '/ar' },
    },
    openGraph: {
      type: 'website',
      locale: lang === 'ar' ? 'ar' : 'nl_NL',
      alternateLocale: lang === 'ar' ? 'nl_NL' : 'ar',
      url: `${siteConfig.baseUrl}${path}`,
      siteName: 'Verkeersplus',
      title: titles[lang],
      description: descriptions[lang],
      images: [{ url: '/images/road-bg.webp', width: 1376, height: 768, alt: 'Verkeersplus — verkeersregelaars op de weg' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[lang],
      description: descriptions[lang],
      images: ['/images/road-bg.webp'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  url: siteConfig.baseUrl,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  vatID: siteConfig.btw,
  identifier: { '@type': 'PropertyValue', propertyID: 'KvK', value: siteConfig.kvk },
  areaServed: {
    '@type': 'Country',
    name: 'Nederland',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'NL',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const lang = (await params).lang as Lang
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${notoArabic.variable}`}
    >
      <body className="bg-bg text-muted font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <LangProvider lang={lang}>
          {children}
          <WhatsAppButton />
        </LangProvider>
      </body>
    </html>
  )
}
