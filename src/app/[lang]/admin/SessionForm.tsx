import { adminText } from './text'
import type { Lang } from '@/types'

export type SessionFormValues = {
  id?: string
  date: string
  start_time: string
  end_time: string
  location: string
  language: string
  price: string
  seats_total: string
  status: string
  details: string
  notes: string
}

export const emptySessionForm: SessionFormValues = {
  date: '',
  start_time: '08:30',
  end_time: '16:30',
  location: '',
  language: 'Nederlands',
  price: '',
  seats_total: '12',
  status: 'open',
  details: '',
  notes: '',
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid content-start gap-1.5 text-[13px] font-medium text-muted">
      {label}
      {children}
      {hint && <span className="text-[12px] font-normal text-dim">{hint}</span>}
    </label>
  )
}

export default function SessionForm({
  lang,
  action,
  values,
  submitLabel,
}: {
  lang: Lang
  action: (formData: FormData) => Promise<void>
  values: SessionFormValues
  submitLabel: string
}) {
  const a = adminText[lang]
  return (
    // key: when navigating between pages the fields must really be refilled.
    <form key={JSON.stringify(values)} action={action} className="grid gap-5 rounded-xl border border-concrete bg-raised p-6">
      <input type="hidden" name="lang" value={lang} />
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={a.fDate}>
          <input type="date" name="date" required defaultValue={values.date} className="field-base" />
        </Field>
        <Field label={a.fStart}>
          <input type="time" name="start_time" required defaultValue={values.start_time} className="field-base" />
        </Field>
        <Field label={a.fEnd} hint={a.fEndHint}>
          <input type="time" name="end_time" defaultValue={values.end_time} className="field-base" />
        </Field>
      </div>

      <Field label={a.fLocation} hint={a.fLocationHint}>
        <input type="text" name="location" required defaultValue={values.location} className="field-base" dir="ltr" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={a.fPrice} hint={a.fPriceHint}>
          <input type="text" inputMode="decimal" name="price" required defaultValue={values.price} className="field-base" dir="ltr" />
        </Field>
        <Field label={a.fSeats}>
          <input type="number" name="seats_total" min={1} max={500} required defaultValue={values.seats_total} className="field-base" dir="ltr" />
        </Field>
        <Field label={a.fLanguage}>
          <input type="text" name="language" defaultValue={values.language} className="field-base" />
        </Field>
      </div>

      <Field label={a.fStatus} hint={a.fStatusHint}>
        <select name="status" defaultValue={values.status} className="field-base">
          <option value="open">{a.sessionStatus.open}</option>
          <option value="closed">{a.sessionStatus.closed}</option>
          <option value="cancelled">{a.sessionStatus.cancelled}</option>
        </select>
      </Field>

      <Field label={a.fDetails} hint={a.fDetailsHint}>
        <textarea name="details" rows={3} defaultValue={values.details} className="field-base min-h-[90px]" />
      </Field>

      <Field label={a.fNotes} hint={a.fNotesHint}>
        <textarea name="notes" rows={3} defaultValue={values.notes} className="field-base min-h-[90px]" />
      </Field>

      <div>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  )
}
