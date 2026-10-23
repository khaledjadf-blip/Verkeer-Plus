import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { siteConfig } from '@/data/content'
import type { Lang } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang
  const path = lang === 'ar' ? '/ar/privacy' : '/privacy'

  return {
    title: lang === 'ar' ? 'سياسة الخصوصية' : 'Privacyverklaring',
    description: lang === 'ar'
      ? 'كيف تتعامل فيركيرسبلوس سيرفيسز مع البيانات الشخصية التي يتم جمعها عبر الموقع.'
      : 'Hoe Verkeersplus Services B.V. omgaat met persoonsgegevens die via de website worden verzameld.',
    robots: { index: true, follow: true },
    alternates: {
      canonical: path,
      languages: { 'nl-NL': '/privacy', ar: '/ar/privacy' },
    },
  }
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang
  const lastUpdated = new Date().toLocaleDateString(lang === 'ar' ? 'ar' : 'nl-NL', { year: 'numeric', month: 'long' })

  return (
    <>
      <Header />
      <main>
        <section className="py-24">
          <div className="max-w-[760px] mx-auto px-6 md:px-12">
            <span className="stripe" />
            {lang === 'ar' ? (
              <>
                <p className="eyebrow">{'// الخصوصية'}</p>
                <h1 className="font-display font-bold text-[clamp(26px,4vw,38px)] text-white mb-8">
                  سياسة الخصوصية
                </h1>

                <div className="space-y-8 text-[15px] leading-relaxed text-muted">
                  <p>
                    تحرص {siteConfig.legalName} (&quot;فيركيرسبلوس&quot;، &quot;نحن&quot;) على التعامل بعناية مع البيانات
                    الشخصية. توضح هذه الصفحة البيانات التي نجمعها عبر هذا الموقع، والغرض من استخدامها، وحقوقك بشأنها.
                  </p>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">ما هي البيانات التي نجمعها</h2>
                    <p>
                      عند تعبئة نموذج التواصل أو نموذج التقديم للعمل، نستلم البيانات التي تدخلها بنفسك: الاسم،
                      رقم الهاتف، البريد الإلكتروني، مدينة الإقامة، وعند التقديم للعمل — السيرة الذاتية إن وُجدت.
                      عند حجز دورة نحفظ أيضاً تاريخ ومكان ميلادك وحالة الدفع، لأنها ضرورية للتسجيل والشهادة.
                      نحن لا نجمع بيانات عبر ملفات تعريف ارتباط تتبعية أو شبكات إعلانية.
                    </p>
                    <p className="mt-3">
                      نستعين لذلك ببعض مقدّمي الخدمات: Mollie (الدفع)، Supabase (حفظ الحجوزات)، Resend (إرسال
                      البريد الإلكتروني) وVercel (الاستضافة). عند حجز دورة نشارك بياناتك مع شريكنا التعليمي. ولا
                      يستخدمون بياناتك إلا لهذا الغرض.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">لماذا نستخدم هذه البيانات</h2>
                    <p>
                      فقط للتواصل معك بخصوص طلبك أو تقديمك، ولتنفيذ أي مهمة أو تعاون ينتج عن ذلك. نحن لا نبيع
                      أو نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">مدة الاحتفاظ بالبيانات</h2>
                    <p>
                      نحتفظ بالبيانات فقط للمدة اللازمة لمعالجة طلبك، أو في حالة التقديم للعمل، خلال فترة إجراءات
                      التوظيف بالإضافة إلى فترة معقولة بعدها، ما لم تطلب حذفها في وقت أبكر.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">حقوقك</h2>
                    <p>
                      لديك الحق في الاطلاع على بياناتك وتصحيحها وحذفها. للقيام بذلك، تواصل معنا عبر{' '}
                      <a className="text-accent-soft hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
                    </p>
                  </div>

                  <p className="text-[13px] text-dim pt-4 border-t border-concrete">
                    آخر تحديث: {lastUpdated}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow">{'// Privacy'}</p>
                <h1 className="font-display font-bold text-[clamp(26px,4vw,38px)] text-white mb-8">
                  Privacyverklaring
                </h1>

                <div className="space-y-8 text-[15px] leading-relaxed text-muted">
                  <p>
                    {siteConfig.legalName} (&quot;Verkeersplus&quot;, &quot;wij&quot;) hecht waarde aan een zorgvuldige omgang met
                    persoonsgegevens. Deze pagina legt uit welke gegevens wij verzamelen via deze website, waarvoor
                    we ze gebruiken en welke rechten je hebt.
                  </p>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Welke gegevens verzamelen we</h2>
                    <p>
                      Wanneer je het contactformulier of het sollicitatieformulier invult, ontvangen wij de gegevens
                      die je zelf invoert: onder andere naam, telefoonnummer, e-mailadres, woonplaats en — bij een
                      sollicitatie — eventueel een cv. Boek je een opleiding, dan bewaren we ook je geboortedatum,
                      geboorteplaats en betaalstatus; die zijn nodig voor de inschrijving en het certificaat. Wij
                      verzamelen geen gegevens via trackingcookies of advertentienetwerken.
                    </p>
                    <p className="mt-3">
                      Hiervoor gebruiken we een paar dienstverleners: Mollie (betalingen), Supabase (opslag van
                      boekingen), Resend (verzenden van e-mail) en Vercel (hosting). Voor een opleiding delen we je
                      gegevens met onze opleidingspartner. Zij gebruiken je gegevens alleen voor dit doel.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Waarvoor gebruiken we deze gegevens</h2>
                    <p>
                      Uitsluitend om contact met je op te nemen naar aanleiding van je aanvraag of sollicitatie, en om
                      een eventuele opdracht of samenwerking uit te voeren. Wij verkopen of delen jouw gegevens niet
                      aan derden voor marketingdoeleinden.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Bewaartermijn</h2>
                    <p>
                      We bewaren gegevens niet langer dan nodig is om je aanvraag af te handelen of, bij een
                      sollicitatie, gedurende de duur van de sollicitatieprocedure plus een redelijke termijn
                      daarna, tenzij je eerder om verwijdering vraagt.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Jouw rechten</h2>
                    <p>
                      Je hebt recht op inzage, correctie en verwijdering van je gegevens. Neem hiervoor contact op
                      via <a className="text-accent-soft hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
                    </p>
                  </div>

                  <p className="text-[13px] text-dim pt-4 border-t border-concrete">
                    Laatst bijgewerkt: {lastUpdated}.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
