import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { siteConfig } from '@/data/content'
import type { Lang } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = (await params).lang as Lang
  const path = lang === 'ar' ? '/ar/voorwaarden' : '/voorwaarden'

  return {
    title: lang === 'ar' ? 'الشروط والأحكام' : 'Algemene voorwaarden',
    description: lang === 'ar'
      ? 'الشروط والأحكام العامة لتوظيف منظمي حركة المرور وحجز الدورات لدى فيركيرسبلوس سيرفيسز.'
      : 'Algemene voorwaarden voor het inhuren van verkeersregelaars en het boeken van een opleiding bij Verkeersplus Services B.V.',
    robots: { index: true, follow: true },
    alternates: {
      canonical: path,
      languages: { 'nl-NL': '/voorwaarden', ar: '/ar/voorwaarden' },
    },
  }
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
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
                <p className="eyebrow">{'// الشروط'}</p>
                <h1 className="font-display font-bold text-[clamp(26px,4vw,38px)] text-white mb-8">
                  الشروط والأحكام
                </h1>

                <div className="space-y-8 text-[15px] leading-relaxed text-muted">
                  <p>
                    تسري هذه الشروط على المهام التي يتم الاتفاق عليها مع {siteConfig.legalName}
                    (&quot;فيركيرسبلوس&quot;)، ومقرها هولندا، وعلى حجز الدورات عبر هذا الموقع.
                    رقم السجل التجاري (KvK): <bdi>{siteConfig.kvk}</bdi>، الرقم الضريبي (BTW): <bdi>{siteConfig.btw}</bdi>.
                  </p>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">عروض الأسعار والمهام</h2>
                    <p>
                      عروض أسعار فيركيرسبلوس غير ملزمة وتستند إلى المعلومات التي يقدمها العميل مسبقاً (الموقع،
                      المدة، عدد منظمي حركة المرور، طبيعة العمل). تُعتبر المهمة متفقاً عليها بمجرد موافقة الطرفين
                      كتابياً (بما في ذلك عبر البريد الإلكتروني).
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">التنفيذ</h2>
                    <p>
                      يعمل منظمو حركة المرور الذين توفرهم فيركيرسبلوس وفق معايير CROW والمتطلبات القانونية
                      المعمول بها لتنظيم حركة المرور في هولندا. يتم الاتفاق على أي تغييرات في المهمة (مثل المدة
                      أو الموقع) في أسرع وقت ممكن.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">الإلغاء</h2>
                    <p>
                      يجب أن يتم إلغاء المهمة في أقرب وقت ممكن، ويفضل عبر الهاتف أو البريد الإلكتروني، حتى نتمكن
                      من إبلاغ منظمي حركة المرور المجدولين في الوقت المناسب. قد يتم فرض رسوم في حال الإلغاء
                      بوقت قصير جداً؛ يتم تقييم ذلك حسب كل حالة.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">المسؤولية</h2>
                    <p>
                      تلتزم فيركيرسبلوس بتقديم الخدمة المتفق عليها بعناية ووفق المعايير المعمول بها. للاطلاع على
                      اتفاقيات المسؤولية الخاصة، يرجى الرجوع إلى عرض السعر أو الاتفاقية الخاصة بالمهمة المعنية.
                    </p>
                  </div>

                  <div id="opleiding" className="scroll-mt-24 border-t border-concrete pt-8">
                    <h2 className="font-display font-bold text-[22px] text-white mb-4">حجز دورة منظم حركة المرور المحترف</h2>
                    <div className="space-y-5">
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">التسجيل والدفع</h3>
                        <p>
                          تحجز الدورة عبر هذا الموقع وتدفع مسبقاً عبر iDEAL أو البطاقة البنكية (عبر Mollie). يصبح التسجيل
                          نهائياً فقط بعد استلام الدفعة، وعندها تصلك رسالة تأكيد بالبريد الإلكتروني. يقدّم الدورة شريكنا التعليمي.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">الإلغاء من طرفك</h3>
                        <p>
                          الإلغاء مجاني حتى 7 أيام قبل موعد بدء الدورة، ونرجع لك كامل المبلغ. أرسل الإلغاء بالبريد الإلكتروني إلى{' '}
                          <a className="text-accent-soft hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
                          إذا ألغيت خلال الأيام السبعة الأخيرة قبل البدء، أو لم تحضر، فلا يمكن إرجاع المبلغ.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">إذا ألغينا نحن الدورة أو أجّلناها</h3>
                        <p>تختار موعداً آخر مجاناً، أو نرجع لك كامل المبلغ.</p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">يوم الدورة</h3>
                        <p>أحضر إثبات هوية ساري المفعول (جواز سفر أو بطاقة هوية أو رخصة قيادة)، واحضر قبل 15 دقيقة من البداية.</p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">بياناتك</h3>
                        <p>نستخدم بياناتك فقط للتسجيل والامتحان والشهادة، ونشاركها لهذا الغرض مع شريكنا التعليمي. اقرأ أيضاً صفحة الخصوصية.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">التواصل</h2>
                    <p>
                      أسئلة حول هذه الشروط أو مهمة جارية؟ تواصل معنا عبر{' '}
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
                <p className="eyebrow">{'// Voorwaarden'}</p>
                <h1 className="font-display font-bold text-[clamp(26px,4vw,38px)] text-white mb-8">
                  Algemene voorwaarden
                </h1>

                <div className="space-y-8 text-[15px] leading-relaxed text-muted">
                  <p>
                    Deze voorwaarden gelden voor opdrachten die worden afgesloten met {siteConfig.legalName}
                    (&quot;Verkeersplus&quot;), gevestigd in Nederland, en voor het boeken van een opleiding via deze website.
                    KvK-nummer {siteConfig.kvk}, btw-nummer {siteConfig.btw}.
                  </p>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Offertes en opdrachten</h2>
                    <p>
                      Offertes van Verkeersplus zijn vrijblijvend en gebaseerd op de informatie die de opdrachtgever
                      vooraf verstrekt (locatie, duur, aantal verkeersregelaars, aard van de werkzaamheden). Een
                      opdracht komt tot stand zodra beide partijen schriftelijk (waaronder per e-mail) akkoord zijn.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Uitvoering</h2>
                    <p>
                      Verkeersregelaars die door Verkeersplus worden ingezet, werken conform de geldende CROW-richtlijnen
                      en wettelijke vereisten voor verkeersregeling in Nederland. Wijzigingen in de opdracht (bijvoorbeeld
                      in duur of locatie) worden zo snel mogelijk onderling afgestemd.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Annulering</h2>
                    <p>
                      Annulering van een opdracht dient zo vroeg mogelijk te gebeuren, bij voorkeur telefonisch of per
                      e-mail, zodat wij ingeplande verkeersregelaars tijdig kunnen informeren. Bij annulering op zeer
                      korte termijn kunnen kosten in rekening worden gebracht; dit wordt per situatie beoordeeld.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Aansprakelijkheid</h2>
                    <p>
                      Verkeersplus spant zich in om de afgesproken dienstverlening zorgvuldig en volgens de geldende
                      richtlijnen uit te voeren. Voor specifieke aansprakelijkheidsafspraken verwijzen we naar de
                      offerte of overeenkomst die voor de betreffende opdracht is opgesteld.
                    </p>
                  </div>

                  <div id="opleiding" className="scroll-mt-24 border-t border-concrete pt-8">
                    <h2 className="font-display font-bold text-[22px] text-white mb-4">Opleiding Beroepsverkeersregelaar boeken</h2>
                    <div className="space-y-5">
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">Inschrijving en betaling</h3>
                        <p>
                          Je boekt de opleiding via deze website en betaalt vooraf met iDEAL of creditcard (via Mollie). Je
                          inschrijving is definitief zodra de betaling binnen is; je ontvangt dan een bevestiging per e-mail.
                          De opleiding wordt gegeven door onze opleidingspartner.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">Annuleren door jou</h3>
                        <p>
                          Annuleren is kosteloos tot 7 dagen voor de startdatum; je krijgt dan het volledige bedrag terug.
                          Annuleer per e-mail via{' '}
                          <a className="text-accent-soft hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
                          Bij annuleren binnen 7 dagen voor de start, of als je niet komt, is terugbetaling niet mogelijk.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">Annuleren of verplaatsen door ons</h3>
                        <p>Je kiest kosteloos een andere datum, of je krijgt het volledige bedrag terug.</p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">Op de opleidingsdag</h3>
                        <p>Neem een geldig identiteitsbewijs mee (paspoort, ID-kaart of rijbewijs) en kom 15 minuten voor aanvang.</p>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-[16px] text-white mb-1.5">Je gegevens</h3>
                        <p>We gebruiken je gegevens alleen voor de inschrijving, het examen en het certificaat, en delen ze daarvoor met onze opleidingspartner. Zie ook onze privacyverklaring.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-[18px] text-white mb-2">Contact</h2>
                    <p>
                      Vragen over deze voorwaarden of een lopende opdracht? Neem contact op via{' '}
                      <a className="text-accent-soft hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
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
