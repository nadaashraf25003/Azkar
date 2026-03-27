import { useMemo, useState } from 'react'
import { CategoryTabs } from '../components/CategoryTabs'
import { ZikrCard } from '../components/ZikrCard'
import { useSettings } from '../context/SettingsContext'
import { useAzkarData } from '../hooks/useAzkarData'
import { useTasbeehCounters } from '../hooks/useTasbeehCounters'
import type { AzkarCategory } from '../types/azkar'
import { getAutoDailyCategory } from '../utils/time'

export function HomePage() {
  const initialCategory = getAutoDailyCategory()
  const [activeCategory, setActiveCategory] = useState<AzkarCategory>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const { language } = useSettings()
  const { data, isLoading, isError } = useAzkarData()
  const { counters, increment, decrement, resetCounter } = useTasbeehCounters()

  const filtered = useMemo(() => {
    if (!data) {
      return []
    }

    const normalized = searchQuery.trim().toLowerCase()

    return data.filter((item) => {
      const inCategory = item.category === activeCategory
      const inSearch =
        normalized.length === 0 ||
        item.text.toLowerCase().includes(normalized) ||
        item.textEn.toLowerCase().includes(normalized) ||
        item.benefit.toLowerCase().includes(normalized)

      return inCategory && inSearch
    })
  }, [activeCategory, data, searchQuery])

  const progressPercent = useMemo(() => {
    if (filtered.length === 0) {
      return 0
    }

    const completed = filtered.filter((item) => (counters[item.id] ?? 0) >= item.count).length
    return Math.round((completed / filtered.length) * 100)
  }, [counters, filtered])

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">Loading Azkar...</p>
  }

  if (isError || !data) {
    return <p className="text-sm text-[var(--warn)]">Unable to load Azkar data.</p>
  }

  return (
    <section className="space-y-4 md:space-y-5">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'خطة اليوم' : 'Today plan'}
        </p>
        <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
          {language === 'ar' ? 'أذكارك اليومية' : 'Your Daily Azkar'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'المجموعة المقترحة تلقائيًا حسب الوقت. يمكنك التبديل والبحث بسهولة.'
            : 'The category is selected automatically by time. You can switch and search anytime.'}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
            {language === 'ar' ? 'إنجاز الفئة' : 'Category progress'}: {progressPercent}%
          </span>
          <span className="rounded-full bg-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
            {language === 'ar' ? 'تلقائي' : 'Auto'}: {initialCategory}
          </span>
        </div>
      </div>

      <CategoryTabs
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        language={language}
      />

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث بالكلمة المفتاحية أو الفضل...'
              : 'Search by keyword or benefit...'
          }
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'لا توجد نتائج بهذه الفلاتر.'
            : 'No Azkar found for this filter.'}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <ZikrCard
              key={item.id}
              zikr={item}
              language={language}
              currentCount={counters[item.id] ?? 0}
              onIncrement={increment}
              onDecrement={decrement}
              onReset={resetCounter}
            />
          ))}
        </div>
      )}
    </section>
  )
}
