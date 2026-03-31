import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSettings } from '../context/SettingsContext'

interface ReligiousInfoItem {
  id: string
  category: string
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
  sourceAr: string
  sourceEn: string
}

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  aqeedah: { ar: 'العقيدة', en: 'Aqeedah' },
  fiqh: { ar: 'الفقه', en: 'Fiqh' },
  quran: { ar: 'القرآن', en: 'Quran' },
  seerah: { ar: 'السيرة', en: 'Seerah' },
  akhlaq: { ar: 'الأخلاق', en: 'Manners' },
  dua: { ar: 'الدعاء', en: 'Dua' },
}

async function fetchReligiousInfo(): Promise<ReligiousInfoItem[]> {
  const response = await fetch('/data/religious-info.json')

  if (!response.ok) {
    throw new Error('Failed to load religious information')
  }

  return (await response.json()) as ReligiousInfoItem[]
}

export function ReligiousInfoPage() {
  const { language } = useSettings()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['religious-info'],
    queryFn: fetchReligiousInfo,
    staleTime: Infinity,
  })

  const categories = useMemo(() => {
    if (!data) {
      return []
    }

    return Array.from(new Set(data.map((item) => item.category)))
  }, [data])

  const filteredItems = useMemo(() => {
    if (!data) {
      return []
    }

    const normalized = search.trim().toLowerCase()

    return data.filter((item) => {
      const categoryMatch = activeCategory === 'all' || item.category === activeCategory
      const haystack = `${item.titleAr} ${item.titleEn} ${item.contentAr} ${item.contentEn}`.toLowerCase()
      const searchMatch = normalized.length === 0 || haystack.includes(normalized)

      return categoryMatch && searchMatch
    })
  }, [activeCategory, data, search])

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {language === 'ar' ? 'جارٍ تحميل المعلومات الدينية...' : 'Loading religious information...'}
      </p>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-[var(--warn)]">
        {language === 'ar'
          ? 'تعذر تحميل المعلومات الدينية.'
          : 'Failed to load religious information.'}
      </p>
    )
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'مرجع مبسط' : 'Simple Reference'}
        </p>
        <h1 className="mt-1 font-title text-3xl text-[var(--text-strong)] sm:text-4xl">
          {language === 'ar' ? 'معلومات دينية' : 'Religious Information'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {language === 'ar'
            ? 'قسم يجمع معلومات مختصرة في العقيدة والفقه والسيرة والأخلاق وغيرها.'
            : 'A section with concise insights in aqeedah, fiqh, seerah, manners, and more.'}
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 md:grid-cols-[1fr_auto] md:p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث في المعلومات الدينية...'
              : 'Search religious information...'
          }
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
        />

        <select
          value={activeCategory}
          onChange={(event) => setActiveCategory(event.target.value)}
          className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
        >
          <option value="all">{language === 'ar' ? 'كل الأقسام' : 'All Categories'}</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {language === 'ar'
                ? (CATEGORY_LABELS[category]?.ar ?? category)
                : (CATEGORY_LABELS[category]?.en ?? category)}
            </option>
          ))}
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching information found.'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-[var(--brand-700)]">
                  {language === 'ar'
                    ? (CATEGORY_LABELS[item.category]?.ar ?? item.category)
                    : (CATEGORY_LABELS[item.category]?.en ?? item.category)}
                </span>
              </div>

              <h2
                className="text-lg font-semibold text-[var(--text-strong)]"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {language === 'ar' ? item.titleAr : item.titleEn}
              </h2>

              <p className="mt-2 text-sm leading-7 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.contentAr : item.contentEn}
              </p>

              <p className="mt-3 text-xs font-semibold text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'المصدر' : 'Source'}: {language === 'ar' ? item.sourceAr : item.sourceEn}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
