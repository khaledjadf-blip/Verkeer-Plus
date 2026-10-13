import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beheer',
  robots: { index: false, follow: false },
}

// Admin pages always fetch fresh data, never cached.
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen py-12">
      <div className="mx-auto max-w-[1120px] px-6 md:px-12">{children}</div>
    </main>
  )
}
