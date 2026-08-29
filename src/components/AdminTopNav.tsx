import { NavLink, useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { removeToken } from '../API/token.ts'

const adminLinks = [
  { to: '/admin/azkar', labelAr: 'الأذكار اليومية', labelEn: 'Daily Azkar', icon: '📖' },
  { to: '/admin/tasbeeh', labelAr: 'عداد التسبيح', labelEn: 'Tasbeeh Presets', icon: '📿' },
  { to: '/admin/kids', labelAr: 'منصة الأطفال', labelEn: 'Kids Platform', icon: '🎈' },
  { to: '/admin/messages', labelAr: 'الرسائل والخواطر', labelEn: 'Messages', icon: '💌' },
  { to: '/admin/seerah', labelAr: 'السيرة النبوية', labelEn: 'Seerah', icon: '📜' },
  { to: '/admin/religious-info', labelAr: 'المعلومات الدينية', labelEn: 'Religious Info', icon: '💡' },
  { to: '/admin/questions', labelAr: 'الأسئلة والأجوبة', labelEn: 'Questions', icon: '❓' },
  { to: '/admin/recitations', labelAr: 'التلاوات القرآنية', labelEn: 'Recitations', icon: '🎙️' },
  { to: '/admin/reports', labelAr: 'تقارير الأجهزة والزيارات', labelEn: 'Device Reports', icon: '📊' },
]

export function AdminTopNav() {
  const { language, toggleTheme, theme } = useSettings()
  const navigate = useNavigate()
  const [, setIsAdminAuthenticated] = useLocalStorage<boolean>('azkar-qa-admin-auth', false)
  const [, setQaRole] = useLocalStorage<string>('azkar-qa-viewer-role', 'user')
  const [, setRecitationRole] = useLocalStorage<string>('azkar-recitation-viewer-role', 'user')

  const handleLogout = () => {
    removeToken()
    setIsAdminAuthenticated(false)
    setQaRole('user')
    setRecitationRole('user')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-amber-500/20 bg-[var(--bg)]/95 backdrop-blur-xl shadow-xs">
      <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-4 md:px-6">
        {/* Top bar: Brand + Controls */}
        <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3 sm:gap-3">
          {/* Right/Start: Shield Icon & Title */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-600 sm:h-10 sm:w-10">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="truncate font-title text-sm font-bold text-amber-600 sm:text-base md:text-lg">
                  {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Control Panel'}
                </p>
                <span className="shrink-0 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 sm:text-[10px] dark:text-amber-400">
                  {language === 'ar' ? 'وضع الإشراف' : 'Admin'}
                </span>
              </div>
              <p className="hidden truncate text-[11px] text-[var(--muted)] sm:block">
                {language === 'ar'
                  ? 'إدارة محتوى المنصة والمزامنة المباشرة مع الخادم'
                  : 'Manage platform content & live backend sync'}
              </p>
            </div>
          </div>

          {/* Left/End: Actions (Theme Toggle + Logout) */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-2.5 text-xs font-semibold text-[var(--text)] transition hover:border-amber-500 sm:h-9 sm:px-3"
              title={
                theme === 'light'
                  ? language === 'ar' ? 'التحويل للوضع الداكن' : 'Switch to dark mode'
                  : language === 'ar' ? 'التحويل للوضع الفاتح' : 'Switch to light mode'
              }
            >
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              <span className="hidden sm:inline">
                {theme === 'light'
                  ? language === 'ar' ? 'الوضع الداكن' : 'Dark'
                  : language === 'ar' ? 'الوضع الفاتح' : 'Light'}
              </span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 text-xs font-bold text-red-600 shadow-xs transition hover:bg-red-500/20 active:scale-95 sm:h-9 sm:px-3.5"
              title={language === 'ar' ? 'تسجيل الخروج من لوحة الإشراف' : 'Logout from Admin'}
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="sm:hidden">{language === 'ar' ? 'خروج' : 'Logout'}</span>
              <span className="hidden sm:inline">{language === 'ar' ? 'تسجيل الخروج' : 'Logout Admin'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar: Horizontally scrollable with smooth scroll on mobile */}
        <nav
          className="flex w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-amber-500/20 bg-amber-500/5 p-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }: { isActive: boolean }) =>
                [
                  'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-bold transition active:scale-95 sm:px-3.5 sm:py-2 sm:text-xs md:text-sm',
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-[var(--text)] hover:bg-amber-500/15',
                ].join(' ')
              }
            >
              <span className="text-xs sm:text-sm">{link.icon}</span>
              <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
