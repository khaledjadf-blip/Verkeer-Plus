import { NextResponse } from 'next/server'
import { z } from 'zod'
import { MIN_AGE, courseTitleNl } from '@/data/course'
import { getPaymentProvider, siteUrl, webhookUrl } from '@/lib/payments'
import { BOOKINGS_TABLE, SESSIONS_TABLE, getSupabase, isSupabaseConfigured, type Booking } from '@/lib/supabase'
import { TIME_ZONE } from '@/lib/time'

const bookingSchema = z.object({
  sessionId: z.string().uuid(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(8).max(30),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthPlace: z.string().trim().min(2).max(100),
  company: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(1000).optional(),
  lang: z.enum(['nl', 'ar']).default('nl'),
  // Hidden field: real visitors leave it empty, spam bots don't.
  website: z.string().max(0).optional(),
  acceptTerms: z.literal(true),
})

function age(birthDate: string) {
  const born = new Date(`${birthDate}T00:00:00Z`)
  if (Number.isNaN(born.getTime())) return -1
  const now = new Date()
  let years = now.getUTCFullYear() - born.getUTCFullYear()
  const beforeBirthday =
    now.getUTCMonth() < born.getUTCMonth() ||
    (now.getUTCMonth() === born.getUTCMonth() && now.getUTCDate() < born.getUTCDate())
  if (beforeBirthday) years -= 1
  return years
}

const knownErrors: Record<string, { status: number; error: string }> = {
  SESSION_FULL: { status: 409, error: 'full' },
  SESSION_CLOSED: { status: 409, error: 'closed' },
  SESSION_NOT_FOUND: { status: 404, error: 'not_found' },
}

export async function POST(request: Request) {
  const provider = getPaymentProvider()
  if (!isSupabaseConfigured() || !provider) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 })

  const parsed = bookingSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  const input = parsed.data

  const years = age(input.birthDate)
  if (years < MIN_AGE || years > 100) return NextResponse.json({ ok: false, error: 'age' }, { status: 400 })

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('vp_create_booking', {
    p_session_id: input.sessionId,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_email: input.email.toLowerCase(),
    p_phone: input.phone,
    p_birth_date: input.birthDate,
    p_birth_place: input.birthPlace,
    p_company: input.company || null,
    p_notes: input.notes || null,
    p_lang: input.lang,
  })

  if (error) {
    const known = Object.keys(knownErrors).find((code) => error.message?.includes(code))
    if (known) return NextResponse.json({ ok: false, error: knownErrors[known].error }, { status: knownErrors[known].status })
    console.error('Boeking aanmaken mislukt', error)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }

  const booking = data as Booking

  try {
    const { data: session } = await supabase.from(SESSIONS_TABLE).select('starts_at').eq('id', booking.session_id).single()
    const date = session ? new Date(session.starts_at).toLocaleDateString('nl-NL', { timeZone: TIME_ZONE }) : ''
    const base = siteUrl(request)
    const prefix = input.lang === 'ar' ? '/ar' : ''
    const payment = await provider.createPayment({
      bookingId: booking.id,
      amountCents: booking.amount_cents,
      description: `${courseTitleNl} ${date} – ${booking.first_name} ${booking.last_name}`,
      redirectUrl: `${base}${prefix}/boeken/bedankt?b=${booking.id}`,
      webhookUrl: webhookUrl(base, '/api/payments/webhook'),
    })
    if (!payment.checkoutUrl) throw new Error('Geen checkout-URL ontvangen')

    const { error: updateError } = await supabase
      .from(BOOKINGS_TABLE)
      .update({ payment_provider: provider.name, payment_id: payment.id })
      .eq('id', booking.id)
    if (updateError) throw updateError

    return NextResponse.json({ ok: true, checkoutUrl: payment.checkoutUrl })
  } catch (paymentError) {
    console.error('Betaling aanmaken mislukt', paymentError)
    // Release the seat right away.
    await supabase.from(BOOKINGS_TABLE).update({ status: 'failed' }).eq('id', booking.id).eq('status', 'pending')
    return NextResponse.json({ ok: false, error: 'server' }, { status: 502 })
  }
}
