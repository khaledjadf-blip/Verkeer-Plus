import { NextResponse } from 'next/server'
import { syncPayment } from '@/lib/bookingPayments'
import { UUID } from '@/lib/sessions'
import { BOOKINGS_TABLE, getSupabase, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Used by the thank-you page. Also checks the payment with Mollie itself,
// in case the webhook has not arrived (yet).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id) || !isSupabaseConfigured()) return NextResponse.json({ status: 'unknown' }, { status: 404 })

  const { data: booking } = await getSupabase()
    .from(BOOKINGS_TABLE)
    .select('status, payment_id, session_id')
    .eq('id', id)
    .maybeSingle()
  if (!booking) return NextResponse.json({ status: 'unknown' }, { status: 404 })

  let status: string = booking.status
  if (status === 'pending' && booking.payment_id) {
    try {
      status = (await syncPayment(booking.payment_id)) ?? status
    } catch (error) {
      console.error('Betaalstatus controleren mislukt', error)
    }
  }

  return NextResponse.json({ status, sessionId: booking.session_id }, { headers: { 'Cache-Control': 'no-store' } })
}
