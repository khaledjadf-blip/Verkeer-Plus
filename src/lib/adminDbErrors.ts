// Turns a database error into an explanation the admin can act on.
type DbError = { code?: string; message?: string; details?: string | null } | null | undefined

export function explainDbError(error: DbError, action = 'Opslaan', status?: number): string {
  const code = error?.code ?? ''
  const text = `${error?.message ?? ''} ${error?.details ?? ''}`.trim()

  if (code === '42P01' || code === 'PGRST205' || (status === 404 && !error?.message) || /does not exist|could not find the table|schema cache/i.test(text)) {
    return 'De tabellen bestaan nog niet in Supabase. Voer het bestand supabase/schema.sql uit in Supabase → SQL Editor → Run.'
  }
  if (code === 'PGRST202' || /could not find the function/i.test(text)) {
    return 'De database mist een functie. Voer het bestand supabase/schema.sql opnieuw uit in Supabase → SQL Editor → Run (dat is veilig).'
  }
  if (code === '42501' || /permission denied/i.test(text)) {
    return 'Geen toegang tot de database. Gebruik in Vercel bij SUPABASE_SERVICE_ROLE_KEY de geheime sleutel (service_role / secret), niet de anon- of publishable-sleutel.'
  }
  if (/invalid api key|jwt|unauthorized|no api key/i.test(text)) {
    return 'De databasesleutel klopt niet. Controleer SUPABASE_SERVICE_ROLE_KEY in Vercel (zonder spaties ervoor of erna).'
  }
  if (code === 'PGRST125' || /fetch failed|ENOTFOUND|getaddrinfo|ECONNREFUSED|invalid url/i.test(text)) {
    return 'Supabase is niet bereikbaar. Controleer SUPABASE_URL in Vercel (bijv. https://xxxx.supabase.co, zonder /rest/v1).'
  }
  return `${action} is mislukt. Technische melding: ${[code, text].filter(Boolean).join(' – ') || 'onbekend'}`
}
