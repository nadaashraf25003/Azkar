import { NavLink, Outlet } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

export function CounterPage() {
  const { language } = useSettings()

  return (
    <section className="space-y-4 md:space-y-5">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'العداد' : 'Counter'}
        </p>
        <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
          {language === 'ar' ? 'أدوات العداد' : 'Counter Tools'}
        </h1>
      </div>

      <div className="flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavLink
          to="/counter/tasbeeh"
          className={({ isActive }: { isActive: boolean }) =>
            [
              'shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold transition',
              isActive
                ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                : 'border-[var(--line)] text-[var(--text)] hover:border-[var(--brand-500)] hover:bg-[var(--brand-100)]',
            ].join(' ')
          }
        >
          {language === 'ar' ? 'عداد التسبيح' : 'Tasbeeh Counter'}
        </NavLink>

        <NavLink
          to="/counter/categories"
          className={({ isActive }: { isActive: boolean }) =>
            [
              'shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold transition',
              isActive
                ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                : 'border-[var(--line)] text-[var(--text)] hover:border-[var(--brand-500)] hover:bg-[var(--brand-100)]',
            ].join(' ')
          }
        >
          {language === 'ar' ? 'عداد الأذكار حسب الفئة' : 'Category Zikr Counters'}
        </NavLink>
      </div>

      <Outlet />
    </section>
  )
}
