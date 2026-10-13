import Link from 'next/link'
import { loginAction } from './actions'
import { adminText } from './text'
import { AdminHeader, Notice } from './ui'
import { isAdmin, isAdminConfigured } from '@/lib/adminAuth'
import { explainDbError } from '@/lib/adminDbErrors'
import { localizedHref } from '@/lib/localizedHref'
import { BOOKINGS_TABLE, SESSIONS_TABLE, getSupabase, isSupabaseConfigured, type CourseSession } from '@/lib/supabase'
import { formatDateTimeNl, formatEuro } from '@/lib/time'
import type { Lang } from '@/types'

type Props = { params: { lang: Lang }; searchParams: { fout?: string; ok?: string; toon?: string } }

function LoginForm({ lang, failed }: { lang: Lang; failed: boolean }) {
  const a = adminText[lang]
  return (
    <div className="mx-auto max-w-md">
      <form action={loginAction} className="grid gap-4 rounded-xl border border-concrete bg-raised p-6">
        <input type="hidden" name="lang" value={lang} />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-soft">{a.kicker}</p>
          <h1 className="mt-1 font-display text-[26px] font-bold text-white">{a.loginTitle}</h1>
        </div>
        {failed && <p role="alert" className="font-semibold text-accent-soft">{a.loginFailed}</p>}
        <label className="grid gap-1.5 text-[13px] font-medium text-muted">
          {a.password}
          <input type="password" name="password" required autoComplete="current-password" autoFocus className="field-base" />
        </label>
        <button type="submit" className="btn-primary">{a.loginBtn}</button>
      </form>
    </div>
  )
}

function SetupMissing({ lang, items }: { lang: Lang; items: string[] }) {
  const a = adminText[lang]
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-concrete bg-raised p-6">
      <h1 className="font-display text-[24px] font-bold text-white">{a.setupTitle}</h1>
      <p className="mt-3 text-muted">{a.setupBody}</p>
      <ul className="mt-3 list-disc ps-5 font-mono text-[13px] text-muted" dir="ltr">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

export default async function AdminPage({ params, searchParams }: Props) {
  const { lang } = params
  const { fout, ok, toon } = searchParams
  const a = adminText[lang]

  const missing = [
    !isAdminConfigured() && 'ADMIN_PASSWORD (min. 12)',
    !isSupabaseConfigured() && 'SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean) as string[]
  if (missing.length) return <SetupMissing lang={lang} items={missing} />

  if (!isAdmin()) return <LoginForm lang={lang} failed={fout === 'login'} />

  const showPast = toon === 'afgelopen'
  const now = new Date().toISOString()
  const supabase = getSupabase()
  let query = supabase.from(SESSIONS_TABLE).select('*')
  query = showPast
    ? query.lt('starts_at', now).order('starts_at', { ascending: false }).limit(100)
    : query.gte('starts_at', now).order('starts_at', { ascending: true })
  const { data, error, status } = await query
  const sessions = (data ?? []) as CourseSession[]

  // Pending payments per date (for the overview).
  const pending = new Map<string, number>()
  if (sessions.length) {
    const { data: rows } = await supabase
      .from(BOOKINGS_TABLE)
      .select('session_id')
      .in('session_id', sessions.map((s) => s.id))
      .eq('status', 'pending')
    for (const row of rows ?? []) pending.set(row.session_id, (pending.get(row.session_id) ?? 0) + 1)
  }

  const href = (p: string) => localizedHref(p, lang)
  const tab = (active: boolean) => (active ? 'text-white underline underline-offset-4' : 'text-dim hover:text-white')

  return (
    <>
      <AdminHeader lang={lang} title={a.listTitle} />
      <Notice lang={lang} ok={ok} fout={fout === 'login' ? undefined : fout} />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href={href('/admin/sessies/nieuw')} className="btn-primary">{a.newBtn}</Link>
        <a href={href('/admin/export')} className="btn-outline">{a.exportAll}</a>
      </div>

      <div className="mb-4 flex gap-5 font-mono text-[12px] uppercase tracking-[0.08em]">
        <Link href={href('/admin')} className={tab(!showPast)}>{a.upcoming}</Link>
        <Link href={`${href('/admin')}?toon=afgelopen`} className={tab(showPast)}>{a.past}</Link>
      </div>

      {error ? (
        <p role="alert" className="border-s-4 border-accent bg-accent/10 px-4 py-3 font-semibold text-accent-soft">{explainDbError(error, 'Laden', status)}</p>
      ) : sessions.length === 0 ? (
        <p className="rounded-xl border border-concrete bg-raised p-6 text-dim">{a.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-concrete bg-raised">
          <table className="w-full min-w-[720px] text-start text-[14px]">
            <thead className="border-b border-concrete font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
              <tr>
                <th className="px-4 py-3 text-start">{a.colDate}</th>
                <th className="px-4 py-3 text-start">{a.colLocation}</th>
                <th className="px-4 py-3 text-start">{a.colPrice}</th>
                <th className="px-4 py-3 text-start">{a.colSeats}</th>
                <th className="px-4 py-3 text-start">{a.colStatus}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const waiting = pending.get(s.id) ?? 0
                return (
                  <tr key={s.id} className="border-b border-concrete last:border-b-0">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-white" dir="ltr">{formatDateTimeNl(s.starts_at)}</td>
                    <td className="px-4 py-3 text-muted" dir="ltr">{s.location}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted" dir="ltr">{formatEuro(s.price_cents)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-bold text-white" dir="ltr">{s.seats_taken} / {s.seats_total}</span>
                      {waiting > 0 && <span className="ms-2 text-[12px] text-dim">{a.waiting(waiting)}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted">{a.sessionStatus[s.status]}</td>
                    <td className="px-4 py-3 text-end">
                      <Link href={href(`/admin/sessies/${s.id}`)} className="font-semibold text-accent-soft underline underline-offset-4">{a.manage}</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
