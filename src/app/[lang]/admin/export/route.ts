import { NextResponse } from 'next/server'
import { courseTitleNl } from '@/data/course'
import { adminText } from '../text'
import { isAdmin } from '@/lib/adminAuth'
import { UUID, isStalePending } from '@/lib/sessions'
import { BOOKINGS_TABLE, getSupabase, type BookingWithSession } from '@/lib/supabase'
import { formatDateTimeNl } from '@/lib/time'

export const dynamic = 'force-dynamic'

// Semicolon + BOM so Dutch Excel shows the columns and accents correctly.
function csvCell(value: unknown) {
  let text = String(value ?? '')
  // Stop Excel from running input as a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL('/admin', request.url))

  const sessionId = new URL(request.url).searchParams.get('sessie')
  let query = getSupabase()
    .from(BOOKINGS_TABLE)
    .select('*, vp_course_sessions(*)')
    .order('created_at', { ascending: true })
  if (sessionId && UUID.test(sessionId)) query = query.eq('session_id', sessionId)
  const { data, error } = await query
  if (error) {
    console.error('Export mislukt', error)
    return new NextResponse('Export mislukt', { status: 500 })
  }

  const labels = adminText.nl.bookingStatus
  const header = [
    'Opleiding', 'Startdatum', 'Locatie', 'Voornaam', 'Achternaam', 'E-mail', 'Telefoon',
    'Geboortedatum', 'Geboorteplaats', 'Bedrijf', 'Bedrag (EUR)', 'Status', 'Betaald op', 'Geboekt op', 'Opmerking',
  ]
  const rows = ((data ?? []) as BookingWithSession[]).map((b) => {
    const s = b.vp_course_sessions
    return [
      courseTitleNl,
      s ? formatDateTimeNl(s.starts_at) : '',
      s?.location ?? '',
      b.first_name,
      b.last_name,
      b.email,
      b.phone,
      b.birth_date ?? '',
      b.birth_place ?? '',
      b.company ?? '',
      (b.amount_cents / 100).toFixed(2).replace('.', ','),
      isStalePending(b) ? adminText.nl.stalePending : labels[b.status] ?? b.status,
      b.paid_at ? formatDateTimeNl(b.paid_at) : '',
      formatDateTimeNl(b.created_at),
      b.notes ?? '',
    ]
  })

  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n')
  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="boekingen-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
