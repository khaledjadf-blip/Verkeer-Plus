import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PaymentResult from '@/components/booking/PaymentResult'
import { UUID } from '@/lib/sessions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Betaling',
  robots: { index: false, follow: false },
}

export default function PaymentReturnPage({ searchParams }: { searchParams: { b?: string } }) {
  const { b } = searchParams
  if (!b || !UUID.test(b)) notFound()

  return (
    <>
      <Header />
      <main>
        <section className="py-20">
          <div className="mx-auto max-w-[680px] px-6 md:px-12">
            <PaymentResult bookingId={b} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
