import 'server-only'
import { MollieProvider } from '@/lib/payments/mollie'
import type { PaymentProvider } from '@/lib/payments/types'

export function getPaymentProvider(): PaymentProvider | null {
  const key = process.env.MOLLIE_API_KEY
  return key ? new MollieProvider(key) : null
}

/** Base URL of the site for return and webhook links. */
export function siteUrl(request: Request) {
  return (process.env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, '')
}

/**
 * Webhook URL for the payment provider. Mollie cannot reach localhost.
 * Vercel previews with "Deployment Protection" need a bypass secret
 * (Vercel → Settings → Deployment Protection → Protection Bypass for Automation).
 */
export function webhookUrl(base: string, path: string) {
  if (/\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(base)) return null
  const url = new URL(path, base)
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (bypass && process.env.VERCEL_ENV === 'preview') url.searchParams.set('x-vercel-protection-bypass', bypass)
  return url.toString()
}
