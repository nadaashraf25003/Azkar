import { useMemo, useState } from 'react'
import { CategoryTabs } from '../components/CategoryTabs'
import { useSettings } from '../context/SettingsContext'
import {
  useAdhkarCategories,
  useAdhkarByCategory,
} from '../hooks/useAdhkar'
import { useTasbeehCounters } from '../hooks/useTasbeehCounters'
import { BackendErrorState } from '../components/BackendErrorState'
import type { AzkarCategory, ZikrItem } from '../types/azkar'
import { getAutoDailyCategory } from '../utils/time'

export function CategoryCounterPage() {
  const [activeCategory, setActiveCategory] = useState<AzkarCategory>(
    getAutoDailyCategory(),
  )
  const { language } = useSettings()
  const { counters, setCounter, decrement, resetCounter } = useTasbeehCounters()

  const { data: backendCategories, isLoading: isCategoriesLoading, isError: isCategoriesError } = useAdhkarCategories()

  const categoriesList = useMemo(() => {
    if (!backendCategories) return []
    return Array.isArray(backendCategories)
      ? backendCategories
      : (backendCategories as any)?.value || []
  }, [backendCategories])

  const matchedCategory = useMemo(() => {
    return categoriesList.find(
      (c: any) => c.name.toLowerCase() === activeCategory.toLowerCase(),
    )
  }, [categoriesList, activeCategory])

  const { data: backendZikrs, isLoading: isZikrsLoading, isError: isZikrsError } = useAdhkarByCategory(matchedCategory?.id)

  const items = useMemo<ZikrItem[]>(() => {
    const list = Array.isArray(backendZikrs)
      ? backendZikrs
      : (backendZikrs as any)?.value

    if (Array.isArray(list)) {
      return list.map((item: any) => ({
        id: item.id,
        category: activeCategory,
        title: item.transliteration || '',
        text: item.arabicText,
        textEn: item.translation,
        count: item.repeatCount,
        reference: item.source,
        benefit: item.fadl,
      }))
    }
    return []
  }, [backendZikrs, activeCategory])

  const isLoading = isCategoriesLoading || isZikrsLoading
  const isError = isCategoriesError || isZikrsError || (!isLoading && items.length === 0)

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">Loading counter data...</p>
  }

  if (isError) {
    return <BackendErrorState />
  }

  return (
    <section className="space-y-4 md:space-y-5">
      <h1 className="font-title text-2xl text-[var(--text-strong)] sm:text-3xl md:text-4xl">
        {language === 'ar' ? 'عداد الأذكار حسب الفئة' : 'Category Zikr Counters'}
      </h1>

      <CategoryTabs
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        language={language}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const current = counters[item.id] ?? 0
          const isCompleted = current >= item.count

          return (
            <article
              key={item.id}
              onClick={() => {
                if (!isCompleted) {
                  setCounter(item.id, Math.min(item.count, current + 1))
                }
              }}
              className={[
                'rounded-2xl border p-3 sm:p-4 transition-colors',
                isCompleted ? '' : 'cursor-pointer',
                isCompleted
                  ? 'border-[var(--ok)] bg-[var(--brand-100)]'
                  : 'border-[var(--line)] bg-[var(--panel)]',
              ].join(' ')}
            >
              <p className="text-sm font-semibold leading-7 text-[var(--text-strong)]" dir="rtl">
                {language === 'ar' ? item.text : item.textEn}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {current} / {item.count}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    decrement(item.id)
                  }}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setCounter(item.id, Math.min(item.count, current + 1))
                  }}
                  disabled={isCompleted}
                  className={[
                    'rounded-lg px-3 py-2 text-sm font-semibold text-white transition',
                    isCompleted
                      ? 'cursor-not-allowed bg-[var(--muted)]'
                      : 'bg-[var(--brand-500)]',
                  ].join(' ')}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    resetCounter(item.id)
                  }}
                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                >
                  {language === 'ar' ? 'صفر' : 'Zero'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
