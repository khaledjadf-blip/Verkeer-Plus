'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { bookingText } from '@/data/bookingText'
import { siteConfig } from '@/data/content'
import { Field, Input, Textarea, FormMessage } from '@/components/ui/FormField'
import { useLang } from '@/lib/langContext'
import { localizedHref } from '@/lib/localizedHref'
import { HONEYPOT_NAME } from '@/lib/submitForm'

type Errors = Partial<Record<'firstName' | 'lastName' | 'birthDate' | 'birthPlace' | 'email' | 'phone' | 'acceptTerms', string>>

export default function BookingForm({ sessionId }: { sessionId: string }) {
  const { lang } = useLang()
  const b = bookingText[lang]
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    const data = new FormData(e.currentTarget)
    const text = (name: string) => String(data.get(name) ?? '').trim()
    const values = {
      firstName: text('firstName'),
      lastName: text('lastName'),
      birthDate: text('birthDate'),
      birthPlace: text('birthPlace'),
      email: text('email'),
      phone: text('phone'),
      company: text('company') || undefined,
      notes: text('notes') || undefined,
      website: text(HONEYPOT_NAME) || undefined,
      acceptTerms: data.get('acceptTerms') === 'on',
    }

    const next: Errors = {}
    if (!values.firstName) next.firstName = b.errRequired
    if (!values.lastName) next.lastName = b.errRequired
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.birthDate)) next.birthDate = b.errRequired
    if (values.birthPlace.length < 2) next.birthPlace = b.errRequired
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = b.errEmail
    if (values.phone.replace(/\D/g, '').length < 8) next.phone = b.errPhone
    if (!values.acceptTerms) next.acceptTerms = b.errTerms
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, sessionId, lang }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body.ok && body.checkoutUrl) {
        window.location.href = body.checkoutUrl
        return
      }
      setServerError(body.error ?? 'server')
    } catch {
      setServerError('server')
    }
    setSubmitting(false)
  }

  const errorText = serverError
    ? (
      <>
        {b.serverErrors[serverError] ?? b.genericError}
        {(!b.serverErrors[serverError] || serverError === 'unavailable') && (
          <> <a href={`tel:${siteConfig.phoneTel}`} dir="ltr" className="font-bold underline">{siteConfig.phone}</a></>
        )}
      </>
    )
    : null

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-concrete bg-raised p-6 md:p-8">
      <h2 className="mb-1.5 font-display text-[22px] font-bold text-white">{b.formTitle}</h2>
      <p className="mb-7 text-[14px] text-dim">{b.formSub}</p>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Field label={b.firstName} required error={errors.firstName}>
          <Input name="firstName" autoComplete="given-name" maxLength={100} />
        </Field>
        <Field label={b.lastName} required error={errors.lastName}>
          <Input name="lastName" autoComplete="family-name" maxLength={100} />
        </Field>
        <Field label={b.birthDate} required error={errors.birthDate}>
          <Input name="birthDate" type="date" autoComplete="bday" />
        </Field>
        <Field label={b.birthPlace} required error={errors.birthPlace}>
          <Input name="birthPlace" maxLength={100} />
        </Field>
        <Field label={b.email} required error={errors.email}>
          <Input name="email" type="email" autoComplete="email" dir="ltr" maxLength={200} />
        </Field>
        <Field label={b.phone} required error={errors.phone}>
          <Input name="phone" type="tel" autoComplete="tel" dir="ltr" maxLength={30} />
        </Field>
      </div>

      <div className="mb-4">
        <Field label={b.company}>
          <Input name="company" autoComplete="organization" maxLength={150} />
        </Field>
      </div>
      <div className="mb-6">
        <Field label={b.notes}>
          <Textarea name="notes" rows={3} maxLength={1000} />
        </Field>
      </div>

      <div className="mb-6">
        <label className="flex items-start gap-3 text-[14px] text-muted">
          <input type="checkbox" name="acceptTerms" className="mt-1 h-4 w-4 shrink-0 accent-[#d4191b]" />
          <span>
            {b.acceptBefore}
            <Link href={localizedHref('/voorwaarden', lang)} target="_blank" className="font-semibold text-accent-soft underline underline-offset-4">
              {b.acceptLink}
            </Link>
            {b.acceptAfter}
            <span className="ms-1 text-accent-soft" aria-hidden>*</span>
          </span>
        </label>
        {errors.acceptTerms && <p className="mt-1 text-[12px] text-accent-soft">{errors.acceptTerms}</p>}
      </div>

      <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
        <label>Website<input name={HONEYPOT_NAME} tabIndex={-1} autoComplete="off" /></label>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">
        {submitting ? b.paying : `${b.payBtn} →`}
      </button>
      <p className="mt-3 text-center text-[12px] text-dim">{b.payNote}</p>

      <FormMessage type={errorText ? 'error' : null} message={errorText} />
    </form>
  )
}
