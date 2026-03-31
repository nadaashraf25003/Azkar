import { useSettings } from '../context/SettingsContext'

export function Footer() {
  const { language } = useSettings()
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { labelAr: 'الرئيسية', labelEn: 'Home', href: '/' },
    { labelAr: 'الآيات', labelEn: 'Ayat', href: '/ayat' },
    { labelAr: 'المعلومات الدينية', labelEn: 'Religious Info', href: '/religious-info' },
    { labelAr: 'الرسائل', labelEn: 'Messages', href: '/messages' },
    { labelAr: 'الإعدادات', labelEn: 'Settings', href: '/settings' },
  ]

  const features = [
    { labelAr: 'مجاني', labelEn: 'Free' },
    { labelAr: 'بدون إعلانات', labelEn: 'Ad-free' },
    { labelAr: 'مفتوح المصدر', labelEn: 'Open Source' },
  ]

  return (
    <footer className="relative border-t border-[var(--line)] bg-gradient-to-b from-[var(--panel)] to-[rgba(var(--panel-rgb),0.5)] px-4 py-12 md:px-6 md:py-16">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-500)] to-transparent opacity-50" />

      <div className="mx-auto w-full max-w-6xl space-y-10">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* App Info Section */}
          <div className="space-y-4">
            <h2 className="font-title text-2xl font-bold bg-gradient-to-r from-[var(--brand-500)] to-[var(--brand-600)] bg-clip-text text-transparent">
              Azkar
            </h2>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {language === 'ar'
                ? 'تطبيق إسلامي حديث صمم لإثراء يومك بالذكر والمعرفة الدينية.'
                : 'A modern Islamic app designed to enrich your day with remembrance and religious knowledge.'}
            </p>
            {/* Features */}
            <div className="flex flex-wrap gap-3 pt-3">
              {features.map((feature) => (
                <div
                  key={feature.labelEn}
                  className="flex items-center gap-2 rounded-full bg-[var(--brand-500)]/10 px-3 py-1.5 border border-[var(--brand-500)]/20"
                >
                  <span className="text-xs font-medium text-[var(--brand-600)]">
                    {language === 'ar' ? feature.labelAr : feature.labelEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.labelEn} className="group">
                  <a
                    href={link.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition-all duration-300 hover:bg-[var(--brand-500)]/10 hover:text-[var(--brand-500)]"
                  >
                    <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--text-strong)]">
              {language === 'ar' ? 'عن التطبيق' : 'About'}
            </h3>
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {language === 'ar'
                  ? 'منصة آمنة وخاصة تماماً لتعميق معرفتك الدينية وتطوير عاداتك الروحية اليومية.'
                  : 'A secure and fully private platform to deepen your religious knowledge and develop your daily spiritual habits.'}
              </p>
              <div className="rounded-lg bg-[var(--brand-500)]/5 border border-[var(--brand-500)]/20 px-4 py-3">
                <p className="text-xs font-medium text-[var(--brand-600)]">
                  {language === 'ar'
                    ? 'بيانات آمنة بنسبة 100%'
                    : '100% Secure Data'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="relative h-px overflow-hidden bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />

        {/* Bottom Section */}
        <div className="space-y-4">
          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-[var(--muted)]">
              &copy; {currentYear}{' '}
              {language === 'ar'
                ? 'Azkar. جميع الحقوق محفوظة.'
                : 'Azkar. All rights reserved.'}
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="#"
              className="relative text-xs text-[var(--muted)] transition-all duration-300 hover:text-[var(--brand-500)] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--brand-500)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy'}
            </a>
            <span className="text-[var(--line)]">•</span>
            <a
              href="#"
              className="relative text-xs text-[var(--muted)] transition-all duration-300 hover:text-[var(--brand-500)] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--brand-500)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {language === 'ar' ? 'الشروط' : 'Terms'}
            </a>
            <span className="text-[var(--line)]">•</span>
            <a
              href="#"
              className="relative text-xs text-[var(--muted)] transition-all duration-300 hover:text-[var(--brand-500)] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--brand-500)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {language === 'ar' ? 'التواصل' : 'Contact'}
            </a>
          </div>
        </div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand-400)] to-transparent opacity-30" />
    </footer>
  )
}
