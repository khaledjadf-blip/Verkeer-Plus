export type SubmitResult = { ok: true } | { ok: false; reason: 'invalid' | 'file' | 'server' | 'network-error' }

/** Posts a form to one of our own API routes (/api/contact, /api/apply), which e-mail it via Resend. */
export async function submitForm(endpoint: '/api/contact' | '/api/apply', formData: FormData): Promise<SubmitResult> {
  try {
    const res = await fetch(endpoint, { method: 'POST', body: formData })
    const json = await res.json().catch(() => ({}))
    if (res.ok && json.ok) return { ok: true }
    return { ok: false, reason: json.error === 'invalid' || json.error === 'file' ? json.error : 'server' }
  } catch {
    return { ok: false, reason: 'network-error' }
  }
}

/** Hidden spam trap: real visitors never see or fill this field. */
export const HONEYPOT_NAME = 'website'
