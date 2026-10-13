'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { localizedHref } from '@/lib/localizedHref'
import { useT } from '@/lib/langContext'
import { Field, Input, Textarea, Select, RadioPillGroup, FileUpload, FormMessage } from './FormField'
import { fitItems } from '@/data/content'
import { useLang } from '@/lib/langContext'
import { HONEYPOT_NAME, submitForm } from '@/lib/submitForm'

// Must match MAX_CV_BYTES in app/api/apply/route.ts.
const MAX_CV_BYTES = 4 * 1024 * 1024

export default function WerkenBijForm() {
  const t = useT()
  const { lang } = useLang()

  const [rijbewijs, setRijbewijs] = useState('ja')
  const [auto, setAuto] = useState('ja')
  const [pas, setPas] = useState('nee')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [fileError, setFileError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const form = e.currentTarget
    const data = new FormData(form)
    const naam = (data.get('naam') as string).trim()
    const tel = (data.get('telefoon') as string).trim()
    const email = (data.get('email') as string).trim()
    const plaats = (data.get('woonplaats') as string).trim()

    if (!naam || !tel || !email || !plaats) {
      setMessage({ type: 'error', text: t.wbError })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: t.wbEmailError })
      return
    }
    const attachment = data.get('attachment')
    if (attachment instanceof File && attachment.size > MAX_CV_BYTES) {
      setFileError(t.wbFileTooLarge)
      return
    }

    setSubmitting(true)
    const result = await submitForm('/api/apply', new FormData(form))
    setSubmitting(false)
    if (!result.ok && result.reason === 'file') {
      setFileError(t.wbFileTooLarge)
      return
    }
    if (result.ok) {
      setMessage({ type: 'success', text: t.wbSuccess })
      form.reset()
      setCvFile(null)
    } else {
      setMessage({ type: 'error', text: t.wbSubmitError })
    }
  }

  function handleFile(file: File | null) {
    if (file && file.size > MAX_CV_BYTES) {
      setFileError(t.wbFileTooLarge)
      return
    }
    setFileError('')
    setCvFile(file)
  }

  return (
    <div className="flex flex-col gap-10 max-w-[720px] mx-auto">
      {/* Sidebar */}
      <aside className="bg-raised border border-concrete rounded-xl p-7 md:p-8">
        <h3 className="font-display font-bold text-[16px] text-white mb-5">{t.wbSidebarTitle}</h3>
        <ul className="space-y-3.5">
          {fitItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              <span className="text-[14px] leading-snug text-muted">{item[lang]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 pt-4 border-t border-concrete text-[13px] text-dim leading-relaxed">
          {t.wbSidebarNote}{' '}
          <Link href={localizedHref('/opleiding', lang)} className="font-semibold text-accent-soft underline underline-offset-4">
            {lang === 'nl' ? 'Bekijk de opleidingsdata →' : 'عرض مواعيد الدورة ←'}
          </Link>
        </p>
      </aside>

      {/* Form */}
      <div className="bg-raised border border-concrete rounded-xl p-7 md:p-9">
        <h3 className="font-display font-bold text-[20px] text-white mb-1.5">{t.wbFormTitle}</h3>
        <p className="text-[14px] text-dim mb-7">{t.wbFormSub}</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Section: Personal */}
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim mb-3.5 pb-2 border-b border-concrete">
            {t.formNaam.replace(' *', '')} / {t.formTel.replace(' *', '')}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label={t.formNaam} required>
              <Input name="naam" placeholder={t.formNaamPh} required />
            </Field>
            <Field label={t.formTel} required>
              <Input name="telefoon" type="tel" placeholder={t.formTelPh} required />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Field label={t.formEmail} required>
              <Input name="email" type="email" placeholder={t.formEmailPh} required />
            </Field>
            <Field label={t.formPlaats} required>
              <Input name="woonplaats" placeholder={t.formPlaatsPh} required />
            </Field>
          </div>

          {/* Section: Practical */}
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim mb-3.5 pb-2 border-b border-concrete">
            {lang === 'nl' ? 'Praktische vragen' : 'أسئلة عملية'}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Field label={t.formRijbewijs}>
              <RadioPillGroup
                name="rijbewijs"
                value={rijbewijs}
                onChange={setRijbewijs}
                options={[{ value: 'ja', label: t.formJa }, { value: 'nee', label: t.formNee }]}
              />
            </Field>
            <Field label={t.formAuto}>
              <RadioPillGroup
                name="auto"
                value={auto}
                onChange={setAuto}
                options={[{ value: 'ja', label: t.formJa }, { value: 'nee', label: t.formNee }]}
              />
            </Field>
            <Field label={t.formPas}>
              <RadioPillGroup
                name="pas"
                value={pas}
                onChange={setPas}
                options={[{ value: 'ja', label: t.formJa }, { value: 'nee', label: t.formNee }]}
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label={t.formVCA}>
              <Select name="vca">
                <option value="geen">{t.formVCANone}</option>
                <option value="basis">{t.formVCABasis}</option>
                <option value="vol">{t.formVCAVol}</option>
              </Select>
            </Field>
            <Field label={t.formBesch}>
              <Select name="beschikbaarheid">
                <option value="fulltime">{t.formBeschFull}</option>
                <option value="parttime">{t.formBeschPart}</option>
                <option value="weekenden">{t.formBeschWeek}</option>
                <option value="oproep">{t.formBeschCall}</option>
              </Select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Field label={t.formErv}>
              <Select name="ervaring">
                <option value="geen">{t.formErvNone}</option>
                <option value="minder-1">{t.formErvMin}</option>
                <option value="1-3">{t.formErv1_3}</option>
                <option value="3-plus">{t.formErvPlus}</option>
              </Select>
            </Field>
            <Field label={t.formTalen}>
              <Input name="talen" placeholder={t.formTalenPh} />
            </Field>
          </div>

          {/* Section: CV */}
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim mb-3.5 pb-2 border-b border-concrete">
            {lang === 'nl' ? 'CV & toelichting' : 'السيرة الذاتية والتوضيح'}
          </p>

          <div className="mb-4">
            <FileUpload
              id="cv-upload"
              name="attachment"
              accept=".pdf,.doc,.docx"
              label={t.formCV}
              hint={t.formCVHint}
              fileName={cvFile?.name}
              error={fileError}
              onChange={handleFile}
            />
          </div>

          <div className="mb-8">
            <Field label={t.formBericht}>
              <Textarea name="bericht" placeholder={t.formBerichtPh} rows={4} />
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
              {submitting ? t.wbSubmitting : t.wbSubmit}
            </button>
            <p className="text-[12px] text-dim max-w-[260px]">{t.wbPrivacy}</p>
          </div>

          <FormMessage type={message?.type ?? null} message={message?.text} />
        </form>
      </div>
    </div>
  )
}
