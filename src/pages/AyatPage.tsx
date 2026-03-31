import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSettings } from '../context/SettingsContext'

interface AyaItem {
  id: string
  surah: string
  surahEn: string
  ayahNumber: number
  textAr: string
  textEn: string
  audioUrl: string
  reciter: string
}

const AYAT_PER_CARD = 3

async function fetchAyat(): Promise<AyaItem[]> {
  const response = await fetch('/data/ayat.json')

  if (!response.ok) {
    throw new Error('Failed to load Ayat data')
  }

  return (await response.json()) as AyaItem[]
}

export function AyatPage() {
  const { language } = useSettings()
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ayat-data'],
    queryFn: fetchAyat,
    staleTime: Infinity,
  })

  const filtered = useMemo(() => {
    if (!data) {
      return []
    }

    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return data
    }

    return data.filter((aya) => {
      const haystack = `${aya.surah} ${aya.surahEn} ${aya.textAr} ${aya.textEn}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [data, search])

  const ayatGroups = useMemo(() => {
    const groups: AyaItem[][] = []

    for (let index = 0; index < filtered.length; index += AYAT_PER_CARD) {
      groups.push(filtered.slice(index, index + AYAT_PER_CARD))
    }

    return groups
  }, [filtered])

  if (isLoading) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {language === 'ar' ? 'جارٍ تحميل الآيات...' : 'Loading ayat...'}
      </p>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-[var(--warn)]">
        {language === 'ar' ? 'تعذر تحميل الآيات.' : 'Failed to load ayat data.'}
      </p>
    )
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.25),transparent_40%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.18),transparent_35%),linear-gradient(120deg,transparent,rgba(59,130,246,0.06),transparent)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
            {language === 'ar' ? 'صفحة القرآن' : 'Quran Page'}
          </p>
          <h1 className="mt-1 font-title text-3xl leading-tight text-[var(--text-strong)] sm:text-4xl md:text-5xl">
            {language === 'ar' ? 'آيات قرآنية مع التلاوة' : 'Quran Ayat with Recitation'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[var(--muted)] md:text-base">
            {language === 'ar'
              ? 'واجهة مركزة للقراءة والاستماع، تجمع عدة آيات في بطاقة واحدة لتجربة أكثر سلاسة.'
              : 'A focused reading and listening view that groups multiple ayat into each card for a smoother experience.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-[var(--muted)]">
              {language === 'ar' ? `إجمالي الآيات: ${filtered.length}` : `Total Ayat: ${filtered.length}`}
            </span>
            <span className="rounded-full bg-[var(--brand-500)] px-3 py-1 text-white">
              {language === 'ar'
                ? `في كل بطاقة: ${AYAT_PER_CARD}`
                : `Per Card: ${AYAT_PER_CARD}`}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 md:p-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-600)]">
          {language === 'ar' ? 'صفحة القرآن' : 'Quran Page'}
        </label>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث باسم السورة أو كلمات من الآية...'
              : 'Search by surah name or words from the aya...'
          }
          className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching ayat found.'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ayatGroups.map((group, groupIndex) => (
            <article
              key={`${group[0]?.id ?? groupIndex}-group`}
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:p-5"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[var(--brand-100)] px-3 py-1 text-[var(--brand-700)]">
                  {language === 'ar' ? group[0]?.surah : group[0]?.surahEn}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-[var(--muted)]">
                  {language === 'ar'
                    ? `آيات ${group[0]?.ayahNumber} - ${group[group.length - 1]?.ayahNumber}`
                    : `Ayat ${group[0]?.ayahNumber} - ${group[group.length - 1]?.ayahNumber}`}
                </span>
              </div>

              <div className="space-y-4">
                {group.map((aya) => (
                  <div key={aya.id} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 md:p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--brand-500)] px-2 text-xs font-bold text-white">
                        {aya.ayahNumber}
                      </span>
                      <p className="text-xs font-semibold text-[var(--muted)]">
                        {language === 'ar' ? 'رقم الآية' : 'Ayah Number'}
                      </p>
                    </div>

                    <p
                      className="font-title text-xl leading-loose text-[var(--text-strong)] md:text-2xl"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {language === 'ar' ? aya.textAr : aya.textEn}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 md:p-4">
                <p className="mb-2 text-xs text-[var(--muted)]">
                  {language === 'ar' ? 'تسجيل التلاوة' : 'Recitation recording'}: {group[0]?.reciter}
                </p>
                <audio controls className="w-full" preload="none">
                  <source src={group[0]?.audioUrl} type="audio/mpeg" />
                  {language === 'ar'
                    ? 'المتصفح لا يدعم تشغيل الصوت.'
                    : 'Your browser does not support audio playback.'}
                </audio>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}