import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { bookingAction, deleteSessionAction, updateSessionAction } from '../../actions'
import ConfirmButton from '../../ConfirmButton'
import SessionForm from '../../SessionForm'
import { adminText } from '../../text'
import { AdminHeader, Notice } from '../../ui'
import { isAdmin } from '@/lib/adminAuth'
import { localizedHref } from '@/lib/localizedHref'
import { UUID, isStalePending } from '@/lib/sessions'
import { BOOKINGS_TABLE, SESSIONS_TABLE, getSupabase, type Booking, type CourseSession } from '@/lib/supabase'
import { centsToEuroInput, formatDateTime, formatEuro, isoToAmsterdam } from '@/lib/time'
import type { Lang } from '@/types'

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ fout?: string; ok?: string }> }

const smallBtn = 'inline-flex items-center border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-colors'

export default async function SessionDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const lang = (await params).lang as Lang
  const { fout, ok } = await searchParams
  if (!(await isAdmin())) redirect(localizedHref('/admin', lang))
  if (!UUID.test(id)) notFound()
  const a = adminText[lang]

  const supabase = getSupabase()
  const { data } = await supabase.from(SESSIONS_TABLE).select('*').eq('id', id).single()
  if (!data) notFound()
  const session = data as CourseSession

  const { data: bookingRows } = await supabase
    .from(BOOKINGS_TABLE)
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: true })
  const bookings = (bookingRows ?? []) as Booking[]
  const paidCount = bookings.filter((b) => b.status === 'paid').length

  const start = isoToAmsterdam(session.starts_at)
  const values = {
    id: session.id,
    date: start.date,
    start_time: start.time,
    end_time: session.ends_at ? isoToAmsterdam(session.ends_at).time : '',
    location: session.location,
    language: session.language,
    price: centsToEuroInput(session.price_cents),
    seats_total: String(session.seats_total),
    status: session.status,
    details: session.details ?? '',
    notes: session.notes ?? '',
  }
  const href = (p: string) => localizedHref(p, lang)

  return (
    <div className="max-w-5xl">
      <AdminHeader lang={lang} title={formatDateTime(session.starts_at, lang)} back={href('/admin')} />
      <Notice lang={lang} ok={ok} fout={fout} />

      <section className="mb-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-[22px] font-bold text-white">{a.bookings}</h2>
            <p className="text-[13px] text-dim">{a.bookingsSummary(paidCount, session.seats_taken, session.seats_total)}</p>
          </div>
          <a href={`${href('/admin/export')}?sessie=${session.id}`} className="btn-outline">{a.exportThis}</a>
        </div>

        {bookings.length === 0 ? (
          <p className="rounded-xl border border-concrete bg-raised p-6 text-dim">{a.noBookings}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-concrete bg-raised">
            <table className="w-full min-w-[980px] text-[14px]">
              <thead className="border-b border-concrete font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
                <tr>
                  <th className="px-4 py-3 text-start">{a.colName}</th>
                  <th className="px-4 py-3 text-start">{a.colEmail}</th>
                  <th className="px-4 py-3 text-start">{a.colPhone}</th>
                  <th className="px-4 py-3 text-start">{a.colAmount}</th>
                  <th className="px-4 py-3 text-start">{a.colStatus}</th>
                  <th className="px-4 py-3 text-start">{a.colBooked}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const name = `${b.first_name} ${b.last_name}`
                  const active = b.status === 'paid' || b.status === 'pending'
                  return (
                    <tr key={b.id} className="border-b border-concrete align-top last:border-b-0">
                      <td className="px-4 py-3 font-semibold text-white"><bdi>{name}</bdi></td>
                      <td className="px-4 py-3"><a href={`mailto:${b.email}`} className="text-muted underline underline-offset-4">{b.email}</a></td>
                      <td className="whitespace-nowrap px-4 py-3"><a href={`tel:${b.phone}`} dir="ltr" className="text-muted">{b.phone}</a></td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted" dir="ltr">{formatEuro(b.amount_cents)}</td>
                      <td className="px-4 py-3">
                        <span className={b.status === 'paid' ? 'font-bold text-green-400' : 'text-dim'}>{isStalePending(b) ? a.stalePending : a.bookingStatus[b.status]}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-dim">{formatDateTime(b.created_at, lang)}</td>
                      <td className="px-4 py-3">
                        <form action={bookingAction} className="flex flex-wrap justify-end gap-2">
                          <input type="hidden" name="lang" value={lang} />
                          <input type="hidden" name="id" value={b.id} />
                          {b.status === 'paid' && (
                            <label className="flex w-full items-center justify-end gap-2 text-[12px] font-semibold text-dim">
                              <input type="checkbox" name="notify" defaultChecked className="h-4 w-4 accent-[#d4191b]" />
                              {a.notify}
                            </label>
                          )}
                          {b.status === 'paid' && b.payment_id && (
                            <ConfirmButton
                              name="mode"
                              value="terugbetalen"
                              className={`${smallBtn} border-white/20 text-white hover:border-accent`}
                              question={a.confirmRefund(name, formatEuro(b.amount_cents))}
                            >
                              {a.refundBtn}
                            </ConfirmButton>
                          )}
                          {active && (
                            <ConfirmButton
                              name="mode"
                              value="annuleren"
                              className={`${smallBtn} border-white/20 text-white hover:border-accent`}
                              question={a.confirmCancel(name)}
                            >
                              {a.cancelBtn}
                            </ConfirmButton>
                          )}
                          <ConfirmButton
                            name="mode"
                            value="verwijderen"
                            className={`${smallBtn} border-transparent text-accent-soft hover:border-accent`}
                            question={a.confirmDelete(name, b.status === 'paid')}
                          >
                            {a.deleteBtn}
                          </ConfirmButton>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-[22px] font-bold text-white">{a.editTitle}</h2>
          <Link href={`${href('/admin/sessies/nieuw')}?van=${session.id}`} className="btn-outline">{a.copyBtn}</Link>
        </div>
        <SessionForm lang={lang} action={updateSessionAction} values={values} submitLabel={a.saveEdit} />
      </section>

      <section className="rounded-xl border border-accent/40 bg-raised p-6">
        <h2 className="font-display text-[18px] font-bold text-white">{a.deleteSessionTitle}</h2>
        <p className="mt-1 text-[13px] text-dim">{a.deleteSessionBody}</p>
        <form action={deleteSessionAction} className="mt-4">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="id" value={session.id} />
          <ConfirmButton className={`${smallBtn} border-accent text-accent-soft hover:bg-accent/10`} question={a.confirmDeleteSession}>
            {a.deleteBtn}
          </ConfirmButton>
        </form>
      </section>
    </div>
  )
}
