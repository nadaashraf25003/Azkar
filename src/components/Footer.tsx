import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

export function Footer() {
  const { language } = useSettings()
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { labelAr: 'الرئيسية', labelEn: 'Home', href: '/' },
    { labelAr: 'السور', labelEn: 'Surahs', href: '/ayat' },
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
    <footer className="relative border-t border-(--line) bg-linear-to-b from-(--panel) to-[rgba(var(--panel-rgb),0.5)] px-4 py-12 md:px-6 md:py-16">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--brand-500) to-transparent opacity-50" />

      <div className="mx-auto w-full max-w-6xl space-y-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h2 className="font-title text-2xl font-bold bg-linear-to-r from-(--brand-500) to-(--brand-600) bg-clip-text text-transparent">
              Azkar
            </h2>
            <p className="text-sm leading-relaxed text-(--muted)">
              {language === 'ar'
                ? 'تطبيق إسلامي حديث صمم لإثراء يومك بالذكر والمعرفة الدينية.'
                : 'A modern Islamic app designed to enrich your day with remembrance and religious knowledge.'}
            </p>
            <div className="flex flex-wrap gap-3 pt-3">
              {features.map((feature) => (
                <div
                  key={feature.labelEn}
                  className="flex items-center gap-2 rounded-full border border-(--brand-500)/20 bg-(--brand-500)/10 px-3 py-1.5"
                >
                  <span className="text-xs font-medium text-(--brand-600)">
                    {language === 'ar' ? feature.labelAr : feature.labelEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-(--text-strong)">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.labelEn} className="group">
                  <Link
                    to={link.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-(--muted) transition-all duration-300 hover:bg-(--brand-500)/10 hover:text-(--brand-500)"
                  >
                    <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-(--text-strong)">
              {language === 'ar' ? 'عن التطبيق' : 'About'}
            </h3>
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-(--muted)">
                {language === 'ar'
                  ? 'منصة آمنة وخاصة تماماً لتعميق معرفتك الدينية وتطوير عاداتك الروحية اليومية.'
                  : 'A secure and fully private platform to deepen your religious knowledge and develop your daily spiritual habits.'}
              </p>
              <div className="rounded-lg border border-(--brand-500)/20 bg-(--brand-500)/5 px-4 py-3">
                <p className="text-xs font-medium text-(--brand-600)">
                  {language === 'ar' ? 'بيانات آمنة بنسبة 100%' : '100% Secure Data'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-px overflow-hidden bg-linear-to-r from-transparent via-(--line) to-transparent" />

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-xs text-(--muted)">
              &copy; {currentYear}{' '}
              {language === 'ar'
                ? 'Azkar. جميع الحقوق محفوظة.'
                : 'Azkar. All rights reserved.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              to="/privacy"
              className="relative text-xs text-(--muted) transition-all duration-300 hover:text-(--brand-500) after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-(--brand-500) after:transition-all after:duration-300 hover:after:w-full"
            >
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy'}
            </Link>
            <span className="text-(--line)">•</span>
            <Link
              to="/terms"
              className="relative text-xs text-(--muted) transition-all duration-300 hover:text-(--brand-500) after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-(--brand-500) after:transition-all after:duration-300 hover:after:w-full"
            >
              {language === 'ar' ? 'الشروط' : 'Terms'}
            </Link>
            <span className="text-(--line)">•</span>
            <Link
              to="/contact"
              className="relative text-xs text-(--muted) transition-all duration-300 hover:text-(--brand-500) after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-(--brand-500) after:transition-all after:duration-300 hover:after:w-full"
            >
              {language === 'ar' ? 'التواصل' : 'Contact'}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--brand-400) to-transparent opacity-30" />
    </footer>
  )
}
