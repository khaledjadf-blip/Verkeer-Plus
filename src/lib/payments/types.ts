// Generic payment interface, so another provider can be added later
// without touching the rest of the site.

export type PaymentStatus = 'open' | 'pending' | 'authorized' | 'paid' | 'failed' | 'canceled' | 'expired'

export type CreatePaymentInput = {
  bookingId: string
  amountCents: number
  description: string
  redirectUrl: string
  webhookUrl: string | null
}

export type ProviderPayment = {
  id: string
  status: PaymentStatus
  amountCents: number
  bookingId: string | null
  checkoutUrl: string | null
}

export interface PaymentProvider {
  readonly name: string
  createPayment(input: CreatePaymentInput): Promise<ProviderPayment>
  /** Always re-fetches the real status from the provider (never trust the webhook body). */
  getPayment(id: string): Promise<ProviderPayment>
  /** Full refund of a paid payment. */
  refundPayment(id: string, amountCents: number, description: string): Promise<void>
}
