import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Canonicalize: /nl or /nl/... should not exist as a public URL — redirect to the bare path.
  if (pathname === '/nl' || pathname.startsWith('/nl/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/nl/, '') || '/'
    return NextResponse.redirect(url, 308)
  }

  // /ar and /ar/... map directly to the [lang] segment — no rewrite needed.
  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    return NextResponse.next()
  }

  // Everything else is the default (Dutch) locale, served invisibly from /nl/...
  const url = request.nextUrl.clone()
  url.pathname = `/nl${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next|api|icon.svg|robots.txt|sitemap.xml|images).*)'],
}
