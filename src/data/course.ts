// The course Verkeersplus sells online. Price, location and seats are set per date in /admin.
export const COURSE_SLUG = 'beroepsverkeersregelaar'

export const MIN_AGE = 18

export const course = {
  slug: COURSE_SLUG,
  nl: {
    title: 'Beroepsverkeersregelaar',
    eyebrow: 'Opleiding',
    intro:
      'Word beroepsverkeersregelaar en regel het verkeer bij wegwerkzaamheden, evenementen en calamiteiten. De opleiding wordt gegeven door onze opleidingspartner. Kies hieronder een datum, boek je plek en betaal direct online.',
    points: [
      'Opleiding via onze vaste opleidingspartner',
      'Direct online boeken en betalen met iDEAL of creditcard',
      'Na je certificering kun je bij Verkeersplus aan de slag',
    ],
    requirementsTitle: 'Wat heb je nodig?',
    requirements: [
      `Je bent minimaal ${MIN_AGE} jaar`,
      'Een geldig identiteitsbewijs (paspoort, ID-kaart of rijbewijs)',
      'Je naam zoals op je identiteitsbewijs, voor de registratie van je certificaat',
    ],
  },
  ar: {
    title: 'منظم حركة مرور محترف (Beroepsverkeersregelaar)',
    eyebrow: 'الدورة',
    intro:
      'اصبح منظم حركة مرور محترفاً، ونظّم السير في أعمال الطرق والفعاليات والطوارئ. يقدّم الدورة شريكنا التعليمي. اختر موعداً من الأسفل، واحجز مقعدك، وادفع مباشرة عبر الإنترنت.',
    points: [
      'الدورة عبر شريكنا التعليمي الثابت',
      'حجز ودفع مباشر عبر iDEAL أو البطاقة البنكية',
      'بعد حصولك على الشهادة يمكنك العمل مع فيركيرسبلوس',
    ],
    requirementsTitle: 'ماذا تحتاج؟',
    requirements: [
      `عمرك ${MIN_AGE} سنة على الأقل`,
      'إثبات هوية ساري المفعول (جواز سفر أو بطاقة هوية أو رخصة قيادة)',
      'اسمك كما هو في إثبات الهوية، لتسجيل شهادتك',
    ],
  },
}

export const courseTitleNl = course.nl.title
