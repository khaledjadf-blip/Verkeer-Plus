'use client'

import { useState, FormEvent } from 'react'
import { useT } from '@/lib/langContext'
import { useLang } from '@/lib/langContext'
import { contactInfo, siteConfig } from '@/data/content'
import { Field, Input, Textarea, Select, FormMessage } from './FormField'
import { HONEYPOT_NAME, submitForm } from '@/lib/submitForm'

export default function ContactForm() {
  const t = useT()
  const { lang } = useLang()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const data = new FormData(e.currentTarget)
    const naam = (data.get('naam') as string).trim()
    const email = (data.get('email') as string).trim()
    const tel = (data.get('telefoon') as string).trim()
    const bericht = (data.get('bericht') as string).trim()

    if (!naam || !email || !tel || !bericht) {
      setMessage({ type: 'error', text: t.ctError })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: t.wbEmailError })
      return
    }
    setSubmitting(true)
    const form = e.currentTarget
    const result = await submitForm('/api/contact', new FormData(form))
    setSubmitting(false)
    if (result.ok) {
      setMessage({ type: 'success', text: t.ctSuccess })
      form.reset()
    } else {
      setMessage({ type: 'error', text: t.ctSubmitError })
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
      {/* Left: contact info card */}
      <div>
        <div className="bg-raised border border-concrete rounded-xl p-8 mb-6">
          <h2 className="font-display font-bold text-[22px] text-white mb-1.5">{t.ctInfoTitle}</h2>
          <p className="text-[14px] text-dim mb-7">{t.ctInfoSub}</p>

          <ul>
            {contactInfo.map(row => {
              const r = row[lang]
              const valueEl = (
                <span className="text-[15px] text-accent-soft">
                  {row.href
                    ? <a href={row.href} className="hover:underline">{r.value}</a>
                    : r.value
                  }
                </span>
              )
              return (
                <li key={row.key} className="flex justify-between items-baseline gap-4 py-4 border-b border-concrete last:border-none">
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-dim">{r.label}</span>
                  {valueEl}
                </li>
              )
            })}
          </ul>

          <div className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-green-400 border border-green-400/30 bg-green-400/8 rounded px-3 py-1.5">
            <span className="text-green-400">●</span>
            {t.ctBadge.replace('● ', '')}
          </div>
        </div>

        {/* Spoed strip */}
        <div className="p-6 bg-accent/8 border border-accent/25 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <strong className="block font-display text-[18px] text-white mb-1">{t.ctSpoedTitle}</strong>
            <p className="text-[14px] text-muted">{t.ctSpoedBody}</p>
          </div>
          <a
            href={`tel:${siteConfig.phoneTel}`}
            className="font-mono text-[18px] font-bold text-accent-soft hover:underline whitespace-nowrap"
          >
            {siteConfig.phone}
          </a>
        </div>
      </div>

      {/* Right: form */}
      <div className="bg-raised border border-concrete rounded-xl p-8">
        <h2 className="font-display font-bold text-[22px] text-white mb-1.5">{t.ctFormTitle}</h2>
        <p className="text-[14px] text-dim mb-7">{t.ctFormSub}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label={t.formNaam} required>
              <Input name="naam" placeholder={t.formNaamPh} required />
            </Field>
            <Field label={t.formBedrijf}>
              <Input name="bedrijf" placeholder={t.formBedrijfPh} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label={t.formEmail} required>
              <Input name="email" type="email" placeholder={t.formEmailPh} required />
            </Field>
            <Field label={t.formTel} required>
              <Input name="telefoon" type="tel" placeholder={t.formTelPh} required />
            </Field>
          </div>

          <div className="mb-4">
            <Field label={t.formDienst}>
              <Select name="dienst">
                <option value="">{t.formDienstDefault}</option>
                <option value="wegwerkzaamheden">{t.formDienstWeg}</option>
                <option value="evenement">{t.formDienstEv}</option>
                <option value="spoed">{t.formDienstSpoed}</option>
                <option value="anders">{t.formDienstAnders}</option>
              </Select>
            </Field>
          </div>

          <div className="mb-8">
            <Field label={t.formOmschrijving} required>
              <Textarea name="bericht" placeholder={t.formOmschrijvingPh} rows={5} required />
            </Field>
          </div>

          <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0 pointer-events-none">
            <label>Website<input name={HONEYPOT_NAME} tabIndex={-1} autoComplete="off" /></label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t.ctSubmitting : t.ctSubmit}
            </button>
            <p className="text-[12px] text-dim max-w-[220px]">{t.ctNote}</p>
          </div>

          <FormMessage type={message?.type ?? null} message={message?.text} />
        </form>
      </div>
    </div>
  )
}
