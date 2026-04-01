import { useSettings } from '../context/SettingsContext'

export function PrivacyPolicyPage() {
  const { language } = useSettings()

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'الخصوصية والأمان' : 'Privacy & Security'}
        </p>
        <h1 className="mt-1 font-title text-3xl text-[var(--text-strong)] sm:text-4xl">
          {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'ar'
            ? 'نحترم خصوصيتك. هذا التطبيق مصمم ليعمل محليًا قدر الإمكان مع أقل قدر من جمع البيانات.'
            : 'We respect your privacy. This app is designed to work locally as much as possible with minimal data collection.'}
        </p>
      </div>

      <article className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <h2 className="text-lg font-semibold text-[var(--text-strong)]">
          {language === 'ar' ? 'ما الذي نجمعه؟' : 'What We Collect'}
        </h2>
        <p className="text-sm text-[var(--text)]">
          {language === 'ar'
            ? 'لا نقوم بإنشاء حسابات إجبارية. الإعدادات والتفضيلات تحفظ محليًا في متصفحك.'
            : 'We do not require mandatory accounts. Settings and preferences are stored locally in your browser.'}
        </p>

        <h2 className="pt-1 text-lg font-semibold text-[var(--text-strong)]">
          {language === 'ar' ? 'استخدام الموقع الجغرافي' : 'Location Usage'}
        </h2>
        <p className="text-sm text-[var(--text)]">
          {language === 'ar'
            ? 'يتم استخدام الموقع فقط عند طلب مواقيت الصلاة أو اتجاه القبلة، ولا يتم تخزينه على خادمنا.'
            : 'Location is only used when you request prayer times or Qibla direction, and is not stored on our servers.'}
        </p>

        <h2 className="pt-1 text-lg font-semibold text-[var(--text-strong)]">
          {language === 'ar' ? 'خدمات خارجية' : 'Third-party Services'}
        </h2>
        <p className="text-sm text-[var(--text)]">
          {language === 'ar'
            ? 'قد نعتمد على واجهات خارجية مثل مواقيت الصلاة لتقديم بعض البيانات. يخضع استخدامها لسياسات تلك الخدمات.'
            : 'We may rely on external APIs such as prayer-time services to provide certain data. Their own policies apply.'}
        </p>
      </article>
    </section>
  )
}
