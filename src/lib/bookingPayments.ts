// Process payment status: confirm the booking, count the seat and send e-mails.
import 'server-only'
import { courseTitleNl } from '@/data/course'
import { siteConfig } from '@/data/content'
import { getPaymentProvider } from '@/lib/payments'
import { escapeHtml, rowsToHtml, sendEmail } from '@/lib/sendEmail'
import { BOOKINGS_TABLE, getSupabase, type Booking, type BookingWithSession } from '@/lib/supabase'
import { formatDate, formatEuro, formatTimeRange } from '@/lib/time'

const failedStatuses = new Set(['failed', 'canceled', 'expired'])
const BOOKING_SELECT = '*, vp_course_sessions(*)'

const site = siteConfig.baseUrl
const termsUrl = { nl: `${site}/voorwaarden`, ar: `${site}/ar/voorwaarden` }
const courseUrl = { nl: `${site}/opleiding`, ar: `${site}/ar/opleiding` }
const shortUrl = (url: string) => escapeHtml(url.replace(/^https?:\/\//, ''))

const wrap = (inner: string) =>
  `<div style="font-family:Arial,sans-serif;color:#1d1b18;max-width:560px">${inner}</div>`
const divider = '<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">'
const rtl = (inner: string) => `<div dir="rtl" style="text-align:right">${inner}</div>`
// Left-to-right text inside Arabic: isolate with LRI/PDI marks as well, since some mail apps ignore dir on spans.
const ltr = (value: string) => `<span dir="ltr">\u2066${value}\u2069</span>`
// Dutch weekday in the middle of a sentence: "op donderdag 12 november".
const inSentence = (text: string) => text.charAt(0).toLowerCase() + text.slice(1)

function row(label: string, value: string, isRtl = false) {
  return `<tr><td style="padding:${isRtl ? '4px 0 4px 12px' : '4px 12px 4px 0'};font-weight:bold;vertical-align:top">${label}</td><td style="padding:4px 0">${value}</td></tr>`
}

function signature(lang: 'nl' | 'ar') {
  const small = `<span style="color:#777;font-size:12px" dir="ltr">KvK ${siteConfig.kvk} · btw ${siteConfig.btw}</span>`
  return lang === 'ar'
    ? `<p>مع التحية،<br>${ltr(escapeHtml(siteConfig.legalName))}<br>${small}</p>`
    : `<p>Met vriendelijke groet,<br>${escapeHtml(siteConfig.legalName)}<br>${small}</p>`
}

/** Dutch customers get Dutch only; Arabic customers get Arabic first, then Dutch. */
function compose(lang: Booking['lang'], nl: string, ar: string) {
  return wrap(lang === 'ar' ? `${rtl(ar)}${divider}${nl}` : nl)
}

function customerEmailHtml(b: BookingWithSession) {
  const s = b.vp_course_sessions
  const course = escapeHtml(courseTitleNl)
  const location = escapeHtml(s.location)
  const name = escapeHtml(b.first_name)
  const time = escapeHtml(formatTimeRange(s.starts_at, s.ends_at))
  const amount = escapeHtml(formatEuro(b.amount_cents))
  const phone = escapeHtml(siteConfig.phone)
  const email = escapeHtml(siteConfig.email)

  const nl = `
  <h2 style="color:#d4191b">Je boeking is bevestigd</h2>
  <p>Beste ${name},</p>
  <p>Bedankt voor je betaling. Je plek is gereserveerd.</p>
  <table style="border-collapse:collapse;margin:12px 0">
    ${row('Opleiding', course)}
    ${row('Datum', escapeHtml(formatDate(s.starts_at, 'nl')))}
    ${row('Tijd', time)}
    ${row('Locatie', location)}
    ${row('Betaald', amount)}
  </table>
  <p>Neem op de opleidingsdag een geldig identiteitsbewijs mee (paspoort, ID-kaart of rijbewijs). Kom graag 15 minuten voor aanvang.</p>
  <p>Annuleren is kosteloos tot 7 dagen voor de startdatum: stuur dan een e-mail naar ${email}. Daarna is terugbetaling niet mogelijk. Zie onze <a href="${termsUrl.nl}">voorwaarden</a>.</p>
  <p>Vragen? Antwoord op deze e-mail of bel/WhatsApp <a href="tel:${siteConfig.phoneTel}">${phone}</a>.</p>
  ${signature('nl')}`

  const ar = `
    <h2 style="color:#d4191b">تم تأكيد حجزك</h2>
    <p>مرحباً ${name}،</p>
    <p>شكراً لك على الدفع. تم حجز مقعدك.</p>
    <table style="border-collapse:collapse;margin:12px 0">
      ${row('الدورة', course, true)}
      ${row('التاريخ', escapeHtml(formatDate(s.starts_at, 'ar')), true)}
      ${row('الوقت', `${ltr(time)}`, true)}
      ${row('المكان', `${ltr(location)}`, true)}
      ${row('المبلغ المدفوع', `${ltr(amount)}`, true)}
    </table>
    <p>أحضر معك يوم الدورة إثبات هوية ساري المفعول (جواز سفر أو بطاقة هوية أو رخصة قيادة). يرجى الحضور قبل 15 دقيقة من البداية.</p>
    <p>الإلغاء مجاني حتى 7 أيام قبل موعد بدء الدورة: أرسل إيميل إلى ${ltr(email)}. بعد ذلك لا يمكن إرجاع المبلغ. اقرأ <a href="${termsUrl.ar}">الشروط</a>.</p>
    <p>لأي سؤال: رد على هذا الإيميل أو اتصل / واتساب <a href="tel:${siteConfig.phoneTel}">${ltr(phone)}</a>.</p>
    ${signature('ar')}`

  return compose(b.lang, nl, ar)
}

async function sendConfirmationEmails(b: BookingWithSession) {
  const s = b.vp_course_sessions
  const when = `${formatDate(s.starts_at, 'nl')} ${formatTimeRange(s.starts_at, s.ends_at)}`

  const results = await Promise.allSettled([
    sendEmail({
      subject: `Betaalde boeking: ${courseTitleNl} – ${b.first_name} ${b.last_name}`,
      replyTo: b.email,
      html: rowsToHtml('Nieuwe betaalde boeking', [
        ['Opleiding', courseTitleNl],
        ['Datum', when],
        ['Locatie', s.location],
        ['Naam', `${b.first_name} ${b.last_name}`],
        ['E-mail', b.email],
        ['Telefoon', b.phone],
        ['Geboortedatum', b.birth_date],
        ['Geboorteplaats', b.birth_place],
        ['Bedrijf', b.company],
        ['Opmerking', b.notes],
        ['Taal website', b.lang === 'ar' ? 'Arabisch' : 'Nederlands'],
        ['Bedrag', formatEuro(b.amount_cents)],
        ['Betaal-ID', b.payment_id],
        ['Plekken bezet', `${s.seats_taken} / ${s.seats_total}`],
      ]),
    }),
    sendEmail({
      to: b.email,
      fromName: 'Verkeersplus',
      replyTo: process.env.CONTACT_TO_EMAIL,
      subject: b.lang === 'ar'
        ? `تأكيد الحجز: ${courseTitleNl} – ${formatDate(s.starts_at, 'ar')}`
        : `Bevestiging: ${courseTitleNl} op ${inSentence(formatDate(s.starts_at, 'nl'))}`,
      html: customerEmailHtml(b),
    }),
  ])
  for (const r of results) if (r.status === 'rejected') console.error('Bevestigingsmail versturen mislukt', r.reason)
}

/** E-mail to the customer (with a copy to the company) after an admin cancellation. */
export async function sendCancellationEmails(b: BookingWithSession, refunded: boolean) {
  const s = b.vp_course_sessions
  const course = escapeHtml(courseTitleNl)
  const name = escapeHtml(b.first_name)
  const amount = escapeHtml(formatEuro(b.amount_cents))
  const dateNl = escapeHtml(formatDate(s.starts_at, 'nl'))
  const dateAr = escapeHtml(formatDate(s.starts_at, 'ar'))
  const time = escapeHtml(formatTimeRange(s.starts_at, s.ends_at))
  const phone = escapeHtml(siteConfig.phone)

  const nl = `
  <h2 style="color:#d4191b">Je boeking is geannuleerd</h2>
  <p>Beste ${name},</p>
  <p>Je boeking voor <strong>${course}</strong> op ${inSentence(dateNl)} (${time}) is geannuleerd.</p>
  ${refunded
    ? `<p>Wij hebben ${amount} terugbetaald. Het bedrag staat binnen enkele werkdagen weer op je rekening.</p>`
    : `<p>Volgens onze <a href="${termsUrl.nl}">voorwaarden</a> is bij annuleren binnen 7 dagen voor de startdatum geen terugbetaling mogelijk.</p>`}
  <p>Wil je een nieuwe datum boeken? Kijk op <a href="${courseUrl.nl}">${shortUrl(courseUrl.nl)}</a>. Vragen? Antwoord op deze e-mail of bel/WhatsApp <a href="tel:${siteConfig.phoneTel}">${phone}</a>.</p>
  ${signature('nl')}`

  const ar = `
    <h2 style="color:#d4191b">تم إلغاء حجزك</h2>
    <p>مرحباً ${name}،</p>
    <p>تم إلغاء حجزك لدورة <strong>${course}</strong> بتاريخ ${dateAr} (${ltr(time)}).</p>
    ${refunded
      ? `<p>أرجعنا لك مبلغ ${ltr(amount)}. سيصل إلى حسابك خلال أيام عمل قليلة.</p>`
      : `<p>حسب <a href="${termsUrl.ar}">الشروط</a>، الإلغاء خلال الأيام السبعة الأخيرة قبل بدء الدورة لا يشمل إرجاع المبلغ.</p>`}
    <p>لحجز موعد جديد: <a href="${courseUrl.ar}">${ltr(shortUrl(courseUrl.ar))}</a>. لأي سؤال: رد على هذا الإيميل أو اتصل / واتساب <a href="tel:${siteConfig.phoneTel}">${ltr(phone)}</a>.</p>
    ${signature('ar')}`

  const html = compose(b.lang, nl, ar)
  const subjectNl = `Geannuleerd: ${courseTitleNl} op ${inSentence(formatDate(s.starts_at, 'nl'))}`
  const subject = b.lang === 'ar' ? `تم إلغاء الحجز: ${courseTitleNl} – ${formatDate(s.starts_at, 'ar')}` : subjectNl
  const results = await Promise.allSettled([
    sendEmail({ to: b.email, fromName: 'Verkeersplus', replyTo: process.env.CONTACT_TO_EMAIL, subject, html }),
    sendEmail({ subject: `Kopie – ${subjectNl} – ${b.first_name} ${b.last_name}`, replyTo: b.email, html }),
  ])
  for (const r of results) if (r.status === 'rejected') console.error('Annuleringsmail versturen mislukt', r.reason)
  // The customer e-mail is the one that matters.
  return results[0].status === 'fulfilled'
}

export async function getBookingWithSession(id: string) {
  const { data } = await getSupabase().from(BOOKINGS_TABLE).select(BOOKING_SELECT).eq('id', id).maybeSingle()
  return data as BookingWithSession | null
}

/**
 * Fetches the current status from the payment provider and updates the booking.
 * Safe to call often (webhook and return page): a seat and the e-mails are
 * processed only once.
 */
export async function syncPayment(paymentId: string): Promise<Booking['status'] | null> {
  const provider = getPaymentProvider()
  if (!provider) return null

  const payment = await provider.getPayment(paymentId)
  const supabase = getSupabase()
  const { data } = await supabase.from(BOOKINGS_TABLE).select(BOOKING_SELECT).eq('payment_id', payment.id).maybeSingle()
  const booking = data as BookingWithSession | null
  if (!booking || booking.id !== payment.bookingId) return null

  // Cancelled or refunded by admin: Mollie still reports "paid" after a refund, so don't confirm again.
  if (booking.status === 'canceled' || booking.status === 'refunded') return booking.status

  if (payment.status === 'paid') {
    if (payment.amountCents !== booking.amount_cents) {
      console.error('Betaald bedrag wijkt af van boeking', { bookingId: booking.id, paymentId: payment.id })
      return booking.status
    }
    const { data: firstTime, error } = await supabase.rpc('vp_mark_booking_paid', { p_booking_id: booking.id })
    if (error) throw error
    if (firstTime) {
      const fresh = await getBookingWithSession(booking.id)
      await sendConfirmationEmails(fresh ?? booking)
    }
    return 'paid'
  }

  if (failedStatuses.has(payment.status) && booking.status === 'pending') {
    const status = payment.status as Booking['status']
    await supabase.from(BOOKINGS_TABLE).update({ status }).eq('id', booking.id).eq('status', 'pending')
    return status
  }

  return booking.status
}
