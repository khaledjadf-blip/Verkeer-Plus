import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rowsToHtml, sendEmail } from '@/lib/sendEmail'

const schema = z.object({
  naam: z.string().trim().min(1).max(150),
  bedrijf: z.string().trim().max(150).optional(),
  email: z.string().trim().email().max(200),
  telefoon: z.string().trim().min(6).max(30),
  dienst: z.string().trim().max(50).optional(),
  bericht: z.string().trim().min(1).max(5000),
  // Hidden field: real visitors leave it empty.
  website: z.string().max(0).optional(),
})

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const parsed = schema.safeParse(form ? Object.fromEntries(form) : null)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  const p = parsed.data

  try {
    await sendEmail({
      subject: `Nieuwe offerteaanvraag — ${p.naam}`,
      replyTo: p.email,
      html: rowsToHtml('Nieuwe offerteaanvraag via website', [
        ['Naam', p.naam],
        ['Bedrijf', p.bedrijf],
        ['E-mail', p.email],
        ['Telefoon', p.telefoon],
        ['Type aanvraag', p.dienst],
        ['Omschrijving', p.bericht],
      ]),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Offerteaanvraag versturen mislukt', error)
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500 })
  }
}
