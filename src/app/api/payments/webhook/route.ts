import { NextResponse } from 'next/server'
import { syncPayment } from '@/lib/bookingPayments'

// Mollie only sends a payment id (id=tr_xxx). We fetch the real status from
// Mollie ourselves, so a fake notification cannot confirm anything.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const id = String(form?.get('id') ?? '')
  if (!id) return new NextResponse('Bad request', { status: 400 })

  try {
    await syncPayment(id)
  } catch (error) {
    // Unknown or invalid id: nothing to do, don't make Mollie retry.
    if (error instanceof Error && /Mollie fout 404|Ongeldig/.test(error.message)) return new NextResponse('OK', { status: 200 })
    console.error('Webhook verwerken mislukt', error)
    // Mollie retries later.
    return new NextResponse('Error', { status: 500 })
  }
  return new NextResponse('OK', { status: 200 })
}
