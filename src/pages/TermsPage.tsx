import { useSettings } from '../context/SettingsContext'

export function TermsPage() {
  const { language } = useSettings()

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'الاستخدام العادل' : 'Fair Usage'}
        </p>
        <h1 className="mt-1 font-title text-3xl text-[var(--text-strong)] sm:text-4xl">
          {language === 'ar' ? 'الشروط' : 'Terms'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'ar'
            ? 'باستخدامك للتطبيق فإنك توافق على الاستخدام المسؤول والالتزام بالقوانين المحلية.'
            : 'By using this app, you agree to responsible use and compliance with local laws.'}
        </p>
      </div>

      <article className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h2 className="text-lg font-semibold text-[var(--text-strong)]">
          {language === 'ar' ? 'الاستخدام' : 'Usage'}
        </h2>
        <p className="text-sm text-[var(--text)]">
          {language === 'ar'
            ? 'يهدف التطبيق إلى التعليم والتذكير اليومي. يرجى عدم إساءة الاستخدام أو محاولة تعطيل الخدمة.'
            : 'The app is intended for learning and daily remembrance. Please do not misuse it or attempt to disrupt service.'}
        </p>

        <h2 className="pt-1 text-lg font-semibold text-[var(--text-strong)]">
          {language === 'ar' ? 'المحتوى' : 'Content'}
        </h2>
        <p className="text-sm text-[var(--text)]">
          {language === 'ar'
            ? 'نسعى للدقة في المحتوى الديني، ومع ذلك يُنصح بالرجوع إلى أهل العلم في المسائل التفصيلية.'
            : 'We strive for accuracy in religious content, but detailed rulings should be verified with qualified scholars.'}
        </p>

        <h2 className="pt-1 text-lg font-semibold text-[var(--text-strong)]">
          {language === 'ar' ? 'التحديثات' : 'Updates'}
        </h2>
        <p className="text-sm text-[var(--text)]">
          {language === 'ar'
            ? 'قد يتم تحديث هذه الشروط عند تطوير التطبيق. استمرار الاستخدام يعني الموافقة على النسخة الأحدث.'
            : 'These terms may be updated as the app evolves. Continued use indicates acceptance of the latest version.'}
        </p>
      </article>
    </section>
  )
}
