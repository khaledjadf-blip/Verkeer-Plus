// Simple admin login with one password.
// Vercel → Settings → Environment Variables:
//   ADMIN_PASSWORD = strong password (at least 12 characters)
import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'vp_admin'
const SESSION_HOURS = 12

function signingKey(): Buffer | null {
  const password = process.env.ADMIN_PASSWORD
  if (!password || password.length < 12) return null
  // Derived from the password: changing the password logs everyone out.
  return createHash('sha256').update(`vp-admin|${password}`).digest()
}

function sign(expires: number, key: Buffer) {
  return createHmac('sha256', key).update(String(expires)).digest('hex')
}

function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function isAdminConfigured() {
  return signingKey() !== null
}

export function checkPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD
  if (!password || !isAdminConfigured()) return false
  return safeEqual(input, password)
}

export async function startAdminSession() {
  const key = signingKey()
  if (!key) throw new Error('ADMIN_PASSWORD ontbreekt of is te kort.')
  const expires = Date.now() + SESSION_HOURS * 3600_000
  const store = await cookies()
  store.set(COOKIE_NAME, `${expires}.${sign(expires, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  })
}

export async function endAdminSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export async function isAdmin() {
  const key = signingKey()
  if (!key) return false
  const value = (await cookies()).get(COOKIE_NAME)?.value
  if (!value) return false
  const [expiresText, signature] = value.split('.')
  const expires = Number(expiresText)
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false
  return safeEqual(signature, sign(expires, key))
}
