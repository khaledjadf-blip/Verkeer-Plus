// Prices are entered and shown excl. btw; btw is added before payment.
// Must match the rounding in vp_create_booking (supabase/schema.sql).
export const VAT_PERCENT = 21

export function vatCents(priceExclCents: number, vatPercent: number) {
  return Math.round((priceExclCents * vatPercent) / 100)
}

export function priceBreakdown(priceExclCents: number, vatPercent: number) {
  const vat = vatCents(priceExclCents, vatPercent)
  return { excl: priceExclCents, vat, total: priceExclCents + vat, vatPercent }
}
