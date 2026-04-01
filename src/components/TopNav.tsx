import { NavLink } from 'react-router-dom'
import { type AccentColor, useSettings } from '../context/SettingsContext'

const links = [
  { to: '/', labelAr: 'اليوم', labelEn: 'Today' },
  { to: '/ayat', labelAr: 'الآيات', labelEn: 'Ayat' },
  { to: '/religious-info', labelAr: 'معلومات دينية', labelEn: 'Religious Info' },
  { to: '/seerah', labelAr: 'السيرة النبوية', labelEn: 'Seerah' },
  { to: '/recitations', labelAr: 'تلاوات', labelEn: 'Recitations' },
  { to: '/messages', labelAr: 'الرسائل', labelEn: 'Messages' },
  { to: '/favorites', labelAr: 'المفضلة', labelEn: 'Favorites' },
  { to: '/counter', labelAr: 'العداد', labelEn: 'Counter' },
  { to: '/kids', labelAr: 'الأطفال', labelEn: 'Kids' },
  { to: '/prayer-times', labelAr: 'الصلاة', labelEn: 'Prayer' },
  { to: '/asmaa-allah', labelAr: 'أسماء الله الحسنى', labelEn: 'Asmaa Allah' },
  { to: '/questions', labelAr: 'سؤال وجواب', labelEn: 'Q&A' },
  { to: '/settings', labelAr: 'الإعدادات', labelEn: 'Settings' },
]

export function TopNav() {
  const { language, toggleTheme, theme, accentColor, setAccentColor } = useSettings()

  const cycleAccentColor = () => {
    const order: AccentColor[] = ['blue', 'emerald', 'amber', 'rose']
    const currentIndex = order.indexOf(accentColor)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length
    setAccentColor(order[nextIndex])
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-3 py-3 md:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-title text-base text-[var(--brand-600)] sm:text-lg">Azkar</p>
            <p className="truncate text-xs text-[var(--muted)]">
              {language === 'ar' ? 'ذكر يومي بنية صادقة' : 'Daily remembrance with intention'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleAccentColor}
              title={language === 'ar' ? 'تغيير لون التطبيق' : 'Change app color'}
              aria-label={language === 'ar' ? 'تغيير لون التطبيق' : 'Change app color'}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] text-[var(--text)] transition hover:border-[var(--brand-500)]"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3c3 3.2 6 6.4 6 10a6 6 0 1 1-12 0c0-3.6 3-6.8 6-10Z" />
                <path d="M9.5 14.5a2.5 2.5 0 0 0 5 0" />
              </svg>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="shrink-0 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--brand-500)] md:text-sm"
            >
              {theme === 'light'
                ? language === 'ar'
                  ? 'الوضع الداكن'
                  : 'Dark mode'
                : language === 'ar'
                  ? 'الوضع الفاتح'
                  : 'Light mode'}
            </button>
          </div>
        </div>

        <nav className="flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }: { isActive: boolean }) =>
                [
                  'shrink-0 whitespace-nowrap rounded-xl px-2.5 py-2 text-xs font-medium transition md:px-3 md:text-sm',
                  isActive
                    ? 'bg-[var(--brand-500)] text-white'
                    : 'text-[var(--text)] hover:bg-[var(--brand-100)]',
                ].join(' ')
              }
            >
              {language === 'ar' ? link.labelAr : link.labelEn}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
