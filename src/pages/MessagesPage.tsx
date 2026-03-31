import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSettings } from '../context/SettingsContext'

type MessageType = 'religious' | 'reflection'

interface MessageItem {
  id: string
  type: MessageType
  titleAr: string
  titleEn: string
  textAr: string
  textEn: string
  authorAr: string
  authorEn: string
}

async function fetchMessages(): Promise<MessageItem[]> {
  const response = await fetch('/data/messages.json')

  if (!response.ok) {
    throw new Error('Failed to load messages')
  }

  return (await response.json()) as MessageItem[]
}

export function MessagesPage() {
  const { language } = useSettings()
  const [activeType, setActiveType] = useState<'all' | MessageType>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['messages-data'],
    queryFn: fetchMessages,
    staleTime: Infinity,
  })

  const filtered = useMemo(() => {
    if (!data) {
      return []
    }

    const normalized = search.trim().toLowerCase()

    return data.filter((item) => {
      const byType = activeType === 'all' || item.type === activeType
      const haystack = `${item.titleAr} ${item.titleEn} ${item.textAr} ${item.textEn} ${item.authorAr} ${item.authorEn}`
        .toLowerCase()
      const bySearch = normalized.length === 0 || haystack.includes(normalized)

      return byType && bySearch
    })
  }, [activeType, data, search])

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">{language === 'ar' ? 'جارٍ تحميل الرسائل...' : 'Loading messages...'}</p>
  }

  if (isError || !data) {
    return <p className="text-sm text-[var(--warn)]">{language === 'ar' ? 'تعذر تحميل الرسائل.' : 'Failed to load messages.'}</p>
  }

  return (
    <section className="space-y-4 md:space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.2),transparent_45%),radial-gradient(circle_at_95%_0%,rgba(59,130,246,0.14),transparent_40%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
            {language === 'ar' ? 'رسائل يومية' : 'Daily Messages'}
          </p>
          <h1 className="font-title text-3xl text-[var(--text-strong)] sm:text-4xl">
            {language === 'ar' ? 'رسائل دينية وخواطر' : 'Religious Messages and Reflections'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            {language === 'ar'
              ? 'مساحة قصيرة للمعنى: رسائل إيمانية وخواطر تبعث الطمأنينة.'
              : 'A short space for meaning: faith reminders and reflections that bring calm.'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 md:p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveType('all')}
            className={[
              'rounded-xl border px-3 py-2 text-sm font-semibold transition',
              activeType === 'all'
                ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                : 'border-[var(--line)] hover:border-[var(--brand-500)]',
            ].join(' ')}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setActiveType('religious')}
            className={[
              'rounded-xl border px-3 py-2 text-sm font-semibold transition',
              activeType === 'religious'
                ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                : 'border-[var(--line)] hover:border-[var(--brand-500)]',
            ].join(' ')}
          >
            {language === 'ar' ? 'دينية' : 'Religious'}
          </button>
          <button
            type="button"
            onClick={() => setActiveType('reflection')}
            className={[
              'rounded-xl border px-3 py-2 text-sm font-semibold transition',
              activeType === 'reflection'
                ? 'border-[var(--brand-500)] bg-[var(--brand-500)] text-white'
                : 'border-[var(--line)] hover:border-[var(--brand-500)]',
            ].join(' ')}
          >
            {language === 'ar' ? 'خواطر' : 'Reflections'}
          </button>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث في الرسائل أو الكاتب...'
              : 'Search messages or author...'
          }
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لا توجد رسائل مطابقة.' : 'No matching messages.'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:p-5"
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-[var(--brand-700)]">
                  {item.type === 'religious'
                    ? language === 'ar'
                      ? 'دينية'
                      : 'Religious'
                    : language === 'ar'
                      ? 'خواطر'
                      : 'Reflection'}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-[var(--text-strong)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.titleAr : item.titleEn}
              </h2>

              <p className="mt-2 leading-8 text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.textAr : item.textEn}
              </p>

              <p className="mt-4 text-sm font-semibold text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'بقلم' : 'By'}: {language === 'ar' ? item.authorAr : item.authorEn}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}