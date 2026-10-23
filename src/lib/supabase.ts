// Supabase connection — SERVER ONLY (never import in client components).
// Vercel → Settings → Environment Variables:
//   SUPABASE_URL               = https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  = secret service_role key (Project Settings → API)
import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const SESSIONS_TABLE = 'vp_course_sessions'
export const BOOKINGS_TABLE = 'vp_bookings'

export type CourseSession = {
  id: string
  course_slug: string
  starts_at: string
  ends_at: string | null
  location: string
  language: string
  price_cents: number
  seats_total: number
  seats_taken: number
  status: 'open' | 'closed' | 'cancelled'
  details: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type BookingStatus = 'pending' | 'paid' | 'failed' | 'canceled' | 'expired' | 'refunded'

export type Booking = {
  id: string
  session_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  birth_date: string | null
  birth_place: string | null
  company: string | null
  notes: string | null
  lang: 'nl' | 'ar'
  amount_cents: number
  status: BookingStatus
  payment_provider: string | null
  payment_id: string | null
  seat_counted: boolean
  paid_at: string | null
  created_at: string
  updated_at: string
}

export type BookingWithSession = Booking & { vp_course_sessions: CourseSession }

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// Also accept a URL that (by mistake) ends in /rest/v1 or a slash.
function projectUrl(raw: string) {
  return raw.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '').replace(/\/+$/, '')
}

export function getSupabase(): SupabaseClient {
  const rawUrl = process.env.SUPABASE_URL
  const url = rawUrl ? projectUrl(rawUrl) : undefined
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Database-instellingen ontbreken (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
  }
  if (!client) {
    client = createClient(url, key.trim(), { auth: { persistSession: false, autoRefreshToken: false } })
  }
  return client
}
