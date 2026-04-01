import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSettings } from '../context/SettingsContext'

interface SeerahEvent {
  id: string
  yearLabelAr: string
  yearLabelEn: string
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  lessonsAr: string[]
  lessonsEn: string[]
}

async function fetchSeerah(): Promise<SeerahEvent[]> {
  const response = await fetch('/data/seerah.json')

  if (!response.ok) {
    throw new Error('Failed to load seerah data')
  }

  return (await response.json()) as SeerahEvent[]
}

export function SeerahPage() {
  const { language } = useSettings()
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['seerah-data'],
    queryFn: fetchSeerah,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const filteredEvents = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    if (!normalized) {
      return data ?? []
    }

    return (data ?? []).filter((event) => {
      const haystack = `${event.yearLabelAr} ${event.yearLabelEn} ${event.titleAr} ${event.titleEn} ${event.summaryAr} ${event.summaryEn}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [data, search])

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {language === 'ar' ? 'جارٍ تحميل السيرة النبوية...' : 'Loading seerah...'}
      </p>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-[var(--warn)]">
        {language === 'ar' ? 'تعذر تحميل بيانات السيرة.' : 'Failed to load seerah data.'}
      </p>
    )
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'صفحات من السيرة' : 'Moments from the Seerah'}
        </p>
        <h1 className="mt-1 font-title text-3xl text-[var(--text-strong)] sm:text-4xl">
          {language === 'ar' ? 'السيرة النبوية' : 'Prophetic Biography'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'ar'
            ? 'محطات مختصرة من حياة النبي محمد صلى الله عليه وسلم مع دروس عملية في الأخلاق والثبات.'
            : 'A concise timeline from the life of Prophet Muhammad (peace be upon him) with practical lessons in character and perseverance.'}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 md:p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={language === 'ar' ? 'ابحث في أحداث السيرة...' : 'Search Seerah events...'}
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching events found.'}
        </p>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredEvents.map((event) => (
            <article key={event.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
                  {language === 'ar' ? event.yearLabelAr : event.yearLabelEn}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? event.titleAr : event.titleEn}
              </h2>

              <p className="mt-2 text-sm leading-7 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? event.summaryAr : event.summaryEn}
              </p>

              <ul className="mt-3 grid gap-2 text-sm text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {(language === 'ar' ? event.lessonsAr : event.lessonsEn).map((lesson) => (
                  <li key={lesson} className="rounded-xl border border-[var(--line)] px-3 py-2">
                    {lesson}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
