import { useSettings } from '../context/SettingsContext'

export function ContactPage() {
  const { language } = useSettings()

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
        </p>
        <h1 className="mt-1 font-title text-3xl text-[var(--text-strong)] sm:text-4xl">
          {language === 'ar' ? 'التواصل' : 'Contact'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'ar'
            ? 'للاقتراحات أو الملاحظات أو الإبلاغ عن مشكلة، يسعدنا تواصلك.'
            : 'For suggestions, feedback, or bug reports, we are happy to hear from you.'}
        </p>
      </div>

      <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <p className="text-sm text-[var(--text)]">
          {language === 'ar' ? 'راسلنا عبر البريد الإلكتروني:' : 'Reach us by email:'}
        </p>
        <a
          href="mailto:nadanadaashraf25@gmail.com"
          className="mt-2 inline-block rounded-xl bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white"
        >
          support@azkar.app
        </a>
      </article>
    </section>
  )
}
