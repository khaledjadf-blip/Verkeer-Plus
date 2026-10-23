// All course times are Dutch time (Europe/Amsterdam), even when the server runs elsewhere.
export const TIME_ZONE = 'Europe/Amsterdam'

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') }
}

function offsetMs(date: Date) {
  const p = zonedParts(date)
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000
}

/** "2026-11-16" + "08:30" (Dutch time) → UTC ISO string, or null on invalid input. */
export function amsterdamToIso(date: string, time: string): string | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const t = /^(\d{2}):(\d{2})$/.exec(time)
  if (!d || !t) return null
  const guess = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2])
  let result = guess - offsetMs(new Date(guess))
  result = guess - offsetMs(new Date(result))
  const check = new Date(result)
  return Number.isNaN(check.getTime()) ? null : check.toISOString()
}

/** ISO → { date: "2026-11-16", time: "08:30" } in Dutch time. */
export function isoToAmsterdam(iso: string) {
  const p = zonedParts(new Date(iso))
  const pad = (n: number) => String(n).padStart(2, '0')
  return { date: `${p.year}-${pad(p.month)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` }
}

export function formatDate(iso: string, lang: 'nl' | 'ar') {
  const text = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(new Date(iso))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }).format(new Date(iso))
}

export function formatTimeRange(startsAt: string, endsAt: string | null) {
  return endsAt ? `${formatTime(startsAt)} – ${formatTime(endsAt)}` : formatTime(startsAt)
}

export function formatDateTimeNl(iso: string) {
  return formatDateTime(iso, 'nl')
}

export function formatDateTime(iso: string, lang: 'nl' | 'ar') {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  }).format(new Date(iso))
}

export function formatEuro(cents: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100)
}

/** "219" / "219,50" / "219.50" → 21900 / 21950, or null. */
export function euroToCents(input: string): number | null {
  const cleaned = input.trim().replace(/\s|€|eur/gi, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null
  return Math.round(Number(cleaned) * 100)
}

/** 21950 → "219,50", 21900 → "219" (for form inputs). */
export function centsToEuroInput(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',').replace(/,00$/, '')
}
