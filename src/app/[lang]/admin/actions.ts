'use server'

import { redirect } from 'next/navigation'
import { COURSE_SLUG, courseTitleNl } from '@/data/course'
import { checkPassword, endAdminSession, isAdmin, startAdminSession } from '@/lib/adminAuth'
import { explainDbError } from '@/lib/adminDbErrors'
import { sendCancellationEmails, getBookingWithSession } from '@/lib/bookingPayments'
import { localizedHref } from '@/lib/localizedHref'
import { getPaymentProvider } from '@/lib/payments'
import { BOOKINGS_TABLE, SESSIONS_TABLE, getSupabase } from '@/lib/supabase'
import { amsterdamToIso, euroToCents } from '@/lib/time'
import type { Lang } from '@/types'

const statuses = new Set(['open', 'closed', 'cancelled'])
const bookingModes = new Set(['annuleren', 'terugbetalen', 'verwijderen'])

function readLang(formData: FormData): Lang {
  return formData.get('lang') === 'ar' ? 'ar' : 'nl'
}

const path = (lang: Lang, p: string) => localizedHref(p, lang)

function back(target: string, message: string): never {
  redirect(`${target}${target.includes('?') ? '&' : '?'}fout=${encodeURIComponent(message)}`)
}

function requireAdmin(lang: Lang) {
  if (!isAdmin()) redirect(path(lang, '/admin'))
}

export async function loginAction(formData: FormData) {
  const lang = readLang(formData)
  if (!checkPassword(String(formData.get('password') ?? ''))) {
    // A small delay makes guessing the password slower.
    await new Promise((resolve) => setTimeout(resolve, 1000))
    redirect(`${path(lang, '/admin')}?fout=login`)
  }
  startAdminSession()
  redirect(path(lang, '/admin'))
}

export async function logoutAction(formData: FormData) {
  endAdminSession()
  redirect(path(readLang(formData), '/admin'))
}

type SessionInput = {
  course_slug: string
  starts_at: string
  ends_at: string | null
  location: string
  language: string
  price_cents: number
  seats_total: number
  status: string
  details: string | null
  notes: string | null
}

function readSessionForm(formData: FormData, lang: Lang): SessionInput | string {
  const text = (name: string) => String(formData.get(name) ?? '').trim()
  const t = (nl: string, ar: string) => (lang === 'ar' ? ar : nl)

  const date = text('date')
  const starts_at = amsterdamToIso(date, text('start_time'))
  if (!starts_at) return t('Vul een geldige datum en begintijd in.', 'أدخل تاريخاً ووقت بداية صحيحين.')

  let ends_at: string | null = null
  if (text('end_time')) {
    ends_at = amsterdamToIso(date, text('end_time'))
    if (!ends_at || ends_at <= starts_at) return t('De eindtijd moet na de begintijd liggen.', 'وقت النهاية لازم يكون بعد وقت البداية.')
  }

  const location = text('location')
  if (location.length < 3) return t('Vul een locatie in.', 'أدخل المكان.')

  const price_cents = euroToCents(text('price'))
  if (price_cents === null || price_cents < 100) return t('Vul een geldige prijs in (minimaal €1), bijvoorbeeld 295 of 295,50.', 'أدخل سعراً صحيحاً (على الأقل 1 يورو)، مثلاً 295 أو 295,50.')

  const seats_total = Number(text('seats_total'))
  if (!Number.isInteger(seats_total) || seats_total < 1 || seats_total > 500) return t('Vul een geldig aantal plekken in (1 tot 500).', 'أدخل عدد مقاعد صحيح (من 1 إلى 500).')

  const status = text('status') || 'open'
  if (!statuses.has(status)) return t('Ongeldige status.', 'حالة غير صحيحة.')

  return {
    course_slug: COURSE_SLUG,
    starts_at,
    ends_at,
    location,
    language: text('language') || 'Nederlands',
    price_cents,
    seats_total,
    status,
    details: text('details') || null,
    notes: text('notes') || null,
  }
}

export async function createSessionAction(formData: FormData) {
  const lang = readLang(formData)
  requireAdmin(lang)
  const input = readSessionForm(formData, lang)
  if (typeof input === 'string') back(path(lang, '/admin/sessies/nieuw'), input)

  const { data, error, status } = await getSupabase().from(SESSIONS_TABLE).insert(input).select('id').single()
  if (error || !data) {
    console.error('Datum opslaan mislukt', error)
    back(path(lang, '/admin/sessies/nieuw'), explainDbError(error, 'Opslaan', status))
  }
  redirect(`${path(lang, `/admin/sessies/${data.id}`)}?ok=aangemaakt`)
}

export async function updateSessionAction(formData: FormData) {
  const lang = readLang(formData)
  requireAdmin(lang)
  const id = String(formData.get('id') ?? '')
  const target = path(lang, `/admin/sessies/${id}`)
  const input = readSessionForm(formData, lang)
  if (typeof input === 'string') back(target, input)

  const supabase = getSupabase()
  const { data: current } = await supabase.from(SESSIONS_TABLE).select('seats_taken').eq('id', id).single()
  if (!current) back(path(lang, '/admin'), lang === 'ar' ? 'هذا الموعد لم يعد موجوداً.' : 'Deze datum bestaat niet meer.')
  if (input.seats_total < current.seats_taken) {
    back(target, lang === 'ar'
      ? `في ${current.seats_taken} مقاعد مدفوعة. العدد الكلي ما بيقدر يكون أقل.`
      : `Er zijn al ${current.seats_taken} plekken betaald. Het totaal kan niet lager zijn.`)
  }

  const { error } = await supabase.from(SESSIONS_TABLE).update(input).eq('id', id)
  if (error) {
    console.error('Datum bijwerken mislukt', error)
    back(target, explainDbError(error))
  }
  redirect(`${target}?ok=opgeslagen`)
}

export async function deleteSessionAction(formData: FormData) {
  const lang = readLang(formData)
  requireAdmin(lang)
  const id = String(formData.get('id') ?? '')
  const target = path(lang, `/admin/sessies/${id}`)
  const supabase = getSupabase()

  // Paid bookings must be cancelled (and possibly refunded) first, so nothing disappears unnoticed.
  const { count: paid } = await supabase
    .from(BOOKINGS_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('session_id', id)
    .eq('status', 'paid')
  if (paid) {
    back(target, lang === 'ar'
      ? `في هذا الموعد ${paid} حجز مدفوع. ألغِها أولاً، وبعدها بتقدر تحذف الموعد.`
      : `Deze datum heeft ${paid} betaalde boeking(en). Annuleer die eerst; daarna kun je de datum verwijderen.`)
  }

  const { error: bookingsError } = await supabase.from(BOOKINGS_TABLE).delete().eq('session_id', id)
  const { error } = bookingsError ? { error: bookingsError } : await supabase.from(SESSIONS_TABLE).delete().eq('id', id)
  if (error) {
    console.error('Datum verwijderen mislukt', error)
    back(target, explainDbError(error, 'Verwijderen'))
  }
  redirect(`${path(lang, '/admin')}?ok=verwijderd`)
}

export async function bookingAction(formData: FormData) {
  const lang = readLang(formData)
  requireAdmin(lang)
  const id = String(formData.get('id') ?? '')
  const mode = String(formData.get('mode') ?? '')

  const booking = await getBookingWithSession(id)
  if (!booking || !bookingModes.has(mode)) back(path(lang, '/admin'), lang === 'ar' ? 'هذا الحجز لم يعد موجوداً.' : 'Deze boeking bestaat niet meer.')
  const target = path(lang, `/admin/sessies/${booking.session_id}`)

  if (mode === 'terugbetalen') {
    const provider = getPaymentProvider()
    if (booking.status !== 'paid' || !booking.payment_id || !provider) {
      back(target, lang === 'ar' ? 'فقط الحجوزات المدفوعة أونلاين يمكن إرجاع مبلغها.' : 'Alleen betaalde online boekingen kunnen worden terugbetaald.')
    }
    try {
      await provider.refundPayment(booking.payment_id, booking.amount_cents, `Terugbetaling ${courseTitleNl} – ${booking.first_name} ${booking.last_name}`)
    } catch (refundError) {
      console.error('Terugbetalen mislukt', refundError)
      back(target, `Terugbetalen via Mollie is mislukt: ${refundError instanceof Error ? refundError.message : 'onbekende fout'}`)
    }
  }

  const { error } = await getSupabase().rpc('vp_cancel_booking', {
    p_booking_id: booking.id,
    p_status: mode === 'terugbetalen' ? 'refunded' : 'canceled',
    p_delete: mode === 'verwijderen',
  })
  if (error) {
    console.error('Boeking bijwerken mislukt', error)
    back(target, explainDbError(error, mode === 'verwijderen' ? 'Verwijderen' : 'Annuleren'))
  }

  if (mode !== 'verwijderen' && formData.get('notify') === 'on') {
    const sent = await sendCancellationEmails(booking, mode === 'terugbetalen')
    if (!sent) {
      back(target, lang === 'ar'
        ? `تم إلغاء الحجز، لكن لم يتم إرسال الإيميل إلى ${booking.email}. تواصل مع الزبون بنفسك.`
        : `De boeking is geannuleerd, maar de e-mail aan ${booking.email} kon niet worden verstuurd. Neem zelf contact op met de klant.`)
    }
    redirect(`${target}?ok=boeking-${mode}-gemaild`)
  }
  redirect(`${target}?ok=boeking-${mode}`)
}
