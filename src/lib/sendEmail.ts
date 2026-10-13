// Sends e-mail via Resend (https://resend.com) without an extra npm package.
// Vercel → Settings → Environment Variables:
//   RESEND_API_KEY      = re_xxxxxxxx
//   CONTACT_TO_EMAIL    = info@verkeersplus.nl      (where requests arrive)
//   CONTACT_FROM_EMAIL  = website@verkeersplus.nl   (must be on a domain verified in Resend)
import 'server-only'

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function rowsToHtml(title: string, rows: [string, unknown][]): string {
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(value) || '-'}</td></tr>`,
    )
    .join('')
  return `<h2 style="font-family:sans-serif">${escapeHtml(title)}</h2>` +
    `<table style="font-family:sans-serif;border-collapse:collapse">${body}</table>`
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL)
}

export type EmailAttachment = { filename: string; content: string } // content = base64

// Without `to`, the e-mail goes to the company (CONTACT_TO_EMAIL).
export async function sendEmail(opts: {
  subject: string
  html: string
  replyTo?: string
  to?: string
  fromName?: string
  attachments?: EmailAttachment[]
}) {
  const apiKey = process.env.RESEND_API_KEY
  const to = opts.to ?? process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  if (!apiKey || !to || !from) {
    throw new Error('E-mailinstellingen ontbreken (RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL).')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${opts.fromName ?? 'Verkeersplus Website'} <${from}>`,
      to: [to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
    }),
  })

  if (!res.ok) {
    throw new Error(`Resend fout ${res.status}: ${await res.text()}`)
  }
}
