import { redirect } from 'next/navigation'
import { createSessionAction } from '../../actions'
import SessionForm, { emptySessionForm, type SessionFormValues } from '../../SessionForm'
import { adminText } from '../../text'
import { AdminHeader, Notice } from '../../ui'
import { isAdmin } from '@/lib/adminAuth'
import { localizedHref } from '@/lib/localizedHref'
import { UUID } from '@/lib/sessions'
import { SESSIONS_TABLE, getSupabase, type CourseSession } from '@/lib/supabase'
import { centsToEuroInput, isoToAmsterdam } from '@/lib/time'
import type { Lang } from '@/types'

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ fout?: string; van?: string }> }

// "Make a copy": same details, one week later.
async function copyFrom(id: string): Promise<SessionFormValues | null> {
  if (!UUID.test(id)) return null
  const { data } = await getSupabase().from(SESSIONS_TABLE).select('*').eq('id', id).single()
  if (!data) return null
  const s = data as CourseSession
  const week = 7 * 24 * 3600_000
  return {
    date: isoToAmsterdam(new Date(new Date(s.starts_at).getTime() + week).toISOString()).date,
    start_time: isoToAmsterdam(s.starts_at).time,
    end_time: s.ends_at ? isoToAmsterdam(s.ends_at).time : '',
    location: s.location,
    language: s.language,
    price: centsToEuroInput(s.price_cents),
    seats_total: String(s.seats_total),
    status: 'open',
    details: s.details ?? '',
    notes: '',
  }
}

export default async function NewSessionPage({ params, searchParams }: Props) {
  const lang = (await params).lang as Lang
  const { fout, van } = await searchParams
  if (!(await isAdmin())) redirect(localizedHref('/admin', lang))
  const a = adminText[lang]
  const values = (van && (await copyFrom(van))) || emptySessionForm

  return (
    <div className="max-w-3xl">
      <AdminHeader lang={lang} title={a.newTitle} back={localizedHref('/admin', lang)} />
      <Notice lang={lang} fout={fout} />
      <SessionForm lang={lang} action={createSessionAction} values={values} submitLabel={a.saveNew} />
    </div>
  )
}
