import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rowsToHtml, sendEmail, type EmailAttachment } from '@/lib/sendEmail'

// Vercel accepts request bodies up to 4.5 MB, so the CV stays below that.
const MAX_CV_BYTES = 4 * 1024 * 1024
const CV_TYPES = /\.(pdf|doc|docx)$/i

const schema = z.object({
  naam: z.string().trim().min(1).max(150),
  telefoon: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(200),
  woonplaats: z.string().trim().min(1).max(100),
  rijbewijs: z.string().max(10).optional(),
  auto: z.string().max(10).optional(),
  pas: z.string().max(10).optional(),
  vca: z.string().max(20).optional(),
  beschikbaarheid: z.string().max(30).optional(),
  ervaring: z.string().max(30).optional(),
  talen: z.string().trim().max(200).optional(),
  bericht: z.string().trim().max(5000).optional(),
  website: z.string().max(0).optional(),
})

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })

  const fields: Record<string, string> = {}
  form.forEach((value, key) => {
    if (typeof value === 'string') fields[key] = value
  })
  const parsed = schema.safeParse(fields)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  const p = parsed.data

  const attachments: EmailAttachment[] = []
  const cv = form.get('attachment')
  if (cv instanceof File && cv.size > 0) {
    if (cv.size > MAX_CV_BYTES || !CV_TYPES.test(cv.name)) {
      return NextResponse.json({ ok: false, error: 'file' }, { status: 400 })
    }
    attachments.push({ filename: cv.name, content: Buffer.from(await cv.arrayBuffer()).toString('base64') })
  }

  try {
    await sendEmail({
      subject: `Nieuwe sollicitatie verkeersregelaar — ${p.naam}`,
      replyTo: p.email,
      attachments,
      html: rowsToHtml('Nieuwe sollicitatie via website', [
        ['Naam', p.naam],
        ['Telefoon', p.telefoon],
        ['E-mail', p.email],
        ['Woonplaats', p.woonplaats],
        ['Rijbewijs', p.rijbewijs],
        ['Eigen auto', p.auto],
        ['Verkeersregelaarspas', p.pas],
        ['VCA', p.vca],
        ['Beschikbaarheid', p.beschikbaarheid],
        ['Ervaring', p.ervaring],
        ['Talen', p.talen],
        ['Toelichting', p.bericht],
        ['CV', attachments[0]?.filename ?? 'Niet meegestuurd'],
      ]),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Sollicitatie versturen mislukt', error)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
