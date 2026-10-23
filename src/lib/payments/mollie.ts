// Mollie (iDEAL, cards, ...) via the REST API, without an extra npm package.
// Vercel → Settings → Environment Variables:
//   MOLLIE_API_KEY = test_xxx (testing) or live_xxx (real payments)
import 'server-only'
import type { CreatePaymentInput, PaymentProvider, PaymentStatus, ProviderPayment } from '@/lib/payments/types'

const API = 'https://api.mollie.com/v2'

type MolliePayment = {
  id: string
  status: PaymentStatus
  amount: { value: string; currency: string }
  metadata: { bookingId?: string } | null
  _links?: { checkout?: { href: string } }
}

function toProviderPayment(p: MolliePayment): ProviderPayment {
  return {
    id: p.id,
    status: p.status,
    amountCents: Math.round(Number(p.amount.value) * 100),
    bookingId: p.metadata?.bookingId ?? null,
    checkoutUrl: p._links?.checkout?.href ?? null,
  }
}

export class MollieProvider implements PaymentProvider {
  readonly name = 'mollie'

  constructor(private readonly apiKey: string) {}

  private async request<T = MolliePayment>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${this.apiKey.trim()}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`Mollie fout ${res.status}: ${await res.text()}`)
    return res.json()
  }

  async createPayment(input: CreatePaymentInput) {
    const payment = await this.request('/payments', {
      method: 'POST',
      body: JSON.stringify({
        amount: { currency: 'EUR', value: (input.amountCents / 100).toFixed(2) },
        description: input.description.slice(0, 255),
        redirectUrl: input.redirectUrl,
        ...(input.webhookUrl ? { webhookUrl: input.webhookUrl } : {}),
        locale: 'nl_NL',
        metadata: { bookingId: input.bookingId },
      }),
    })
    return toProviderPayment(payment)
  }

  async getPayment(id: string) {
    if (!/^tr_[A-Za-z0-9]+$/.test(id)) throw new Error('Ongeldig Mollie-betaal-id')
    return toProviderPayment(await this.request(`/payments/${id}`))
  }

  async refundPayment(id: string, amountCents: number, description: string) {
    if (!/^tr_[A-Za-z0-9]+$/.test(id)) throw new Error('Ongeldig Mollie-betaal-id')
    await this.request<unknown>(`/payments/${id}/refunds`, {
      method: 'POST',
      body: JSON.stringify({
        amount: { currency: 'EUR', value: (amountCents / 100).toFixed(2) },
        description: description.slice(0, 140),
      }),
    })
  }
}
