import type { MetadataRoute } from 'next'
import { siteConfig } from '@/data/content'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin', '/ar/admin', '/boeken/', '/ar/boeken/'],
      },
    ],
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
    host: siteConfig.baseUrl,
  }
}
