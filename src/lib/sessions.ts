// Upcoming course dates for the public website (server only).
import 'server-only'
import { BOOKINGS_TABLE, SESSIONS_TABLE, getSupabase, isSupabaseConfigured } from '@/lib/supabase'

// Must match the 30 minutes in vp_create_booking (supabase/schema.sql).
export const PENDING_HOLD_MINUTES = 30

/** A booking still waiting for payment after the hold expired: the seat is free again. */
export function isStalePending(b: { status: string; created_at: string }) {
  return b.status === 'pending' && Date.now() - new Date(b.created_at).getTime() > PENDING_HOLD_MINUTES * 60_000
}

/** A sign-up that was never paid: expired, failed, or abandoned at checkout. */
export function isUnfinished(b: { status: string; created_at: string; paid_at: string | null }) {
  return isStalePending(b) || b.status === 'expired' || b.status === 'failed' || (b.status === 'canceled' && !b.paid_at)
}

export type PublicSession = {
  id: string
  courseSlug: string
  startsAt: string
  endsAt: string | null
  location: string
  language: string
  priceCents: number
  seatsLeft: number
  status: 'open' | 'closed'
  details: string | null
}

type SessionRow = {
  id: string
  course_slug: string
  starts_at: string
  ends_at: string | null
  location: string
  language: string
  price_cents: number
  seats_total: number
  seats_taken: number
  status: 'open' | 'closed'
  details: string | null
}

const PUBLIC_COLUMNS = 'id, course_slug, starts_at, ends_at, location, language, price_cents, seats_total, seats_taken, status, details'

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Seats left = total − paid − pending payments (last 30 min).
async function withSeatsLeft(sessions: SessionRow[]): Promise<PublicSession[]> {
  if (!sessions.length) return []
  const holdSince = new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000).toISOString()
  const { data: pending, error } = await getSupabase()
    .from(BOOKINGS_TABLE)
    .select('session_id')
    .in('session_id', sessions.map((s) => s.id))
    .eq('status', 'pending')
    .gt('created_at', holdSince)
  if (error) throw error

  const held = new Map<string, number>()
  for (const row of pending ?? []) held.set(row.session_id, (held.get(row.session_id) ?? 0) + 1)

  return sessions.map((s) => ({
    id: s.id,
    courseSlug: s.course_slug,
    startsAt: s.starts_at,
    endsAt: s.ends_at,
    location: s.location,
    language: s.language,
    priceCents: s.price_cents,
    seatsLeft: Math.max(0, s.seats_total - s.seats_taken - (held.get(s.id) ?? 0)),
    status: s.status,
    details: s.details,
  }))
}

export async function getUpcomingSessions(): Promise<PublicSession[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const { data, error } = await getSupabase()
      .from(SESSIONS_TABLE)
      .select(PUBLIC_COLUMNS)
      .in('status', ['open', 'closed'])
      .gt('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(24)
    if (error) throw error
    return await withSeatsLeft((data ?? []) as SessionRow[])
  } catch (error) {
    console.error('Opleidingsdata ophalen mislukt', error)
    return []
  }
}

/** One date for the booking page; null if it no longer exists or was cancelled. */
export async function getPublicSession(id: string): Promise<PublicSession | null> {
  if (!UUID.test(id) || !isSupabaseConfigured()) return null
  try {
    const { data, error } = await getSupabase()
      .from(SESSIONS_TABLE)
      .select(PUBLIC_COLUMNS)
      .eq('id', id)
      .in('status', ['open', 'closed'])
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const [session] = await withSeatsLeft([data as SessionRow])
    return session
  } catch (error) {
    console.error('Opleidingsdatum ophalen mislukt', error)
    return null
  }
}
