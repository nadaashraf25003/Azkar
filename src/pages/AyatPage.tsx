import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

interface QuranChapterApiItem {
  id: number
  revelation_place: 'makkah' | 'madinah'
  revelation_order: number
  bismillah_pre: boolean
  name_simple: string
  name_arabic: string
  verses_count: number
  translated_name: {
    language_name: string
    name: string
  } | null
}

interface SurahItem {
  id: number
  number: number
  arabicName: string
  englishName: string
  revelationPlace: 'makkah' | 'madinah'
  revelationOrder: number
  versesCount: number
  hasBismillah: boolean
}

async function fetchSurahs(): Promise<SurahItem[]> {
  const response = await fetch('https://api.quran.com/api/v4/chapters')

  if (!response.ok) {
    throw new Error('Failed to load Surah data')
  }

  const data = (await response.json()) as { chapters: QuranChapterApiItem[] }

  return data.chapters.map((chapter) => ({
    id: chapter.id,
    number: chapter.id,
    arabicName: chapter.name_arabic,
    englishName: chapter.translated_name?.name ?? chapter.name_simple,
    revelationPlace: chapter.revelation_place,
    revelationOrder: chapter.revelation_order,
    versesCount: chapter.verses_count,
    hasBismillah: chapter.bismillah_pre,
  }))
}

export function AyatPage() {
  const { language } = useSettings()
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['quran-surahs'],
    queryFn: fetchSurahs,
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

    return data.filter((surah) => {
      const haystack = `${surah.number} ${surah.arabicName} ${surah.englishName} ${surah.revelationPlace}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [data, search])

  const totalSurahs = data?.length ?? 0

  const revelationLabel = (revelationPlace: SurahItem['revelationPlace']) => {
    if (language === 'ar') {
      return revelationPlace === 'makkah' ? 'مكية' : 'مدنية'
    }

    return revelationPlace === 'makkah' ? 'Makkah' : 'Madinah'
  }

  if (isLoading) {
    return (
      <p className="text-sm text-(--muted)">
        {language === 'ar' ? 'جارٍ تحميل السور...' : 'Loading surahs...'}
      </p>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-(--warn)">
        {language === 'ar' ? 'تعذر تحميل السور.' : 'Failed to load surah data.'}
      </p>
    )
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-(--line) bg-(--panel) p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.25),transparent_40%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.18),transparent_35%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-(--brand-600)">
            {language === 'ar' ? 'صفحة السور القرآنية' : 'Quran Surahs'}
          </p>
          <h1 className="mt-1 font-title text-3xl leading-tight text-(--text-strong) sm:text-4xl md:text-5xl">
            {language === 'ar' ? 'سور القرآن الكريم' : 'All Quran Surahs'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-(--muted) md:text-base">
            {language === 'ar'
              ? 'تصفّح السور الـ114 مع البحث السريع، وعدد الآيات، وموضع النزول.'
              : 'Browse all 114 surahs with fast search, verse counts, and revelation place.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full border border-(--line) bg-(--bg) px-3 py-1 text-(--muted)">
              {language === 'ar' ? `إجمالي السور: ${totalSurahs}` : `Total surahs: ${totalSurahs}`}
            </span>
            <span className="rounded-full border border-(--line) bg-(--bg) px-3 py-1 text-(--muted)">
              {language === 'ar' ? `النتائج: ${filtered.length}` : `Matches: ${filtered.length}`}
            </span>
            <Link
              to="/recitations"
              className="rounded-full bg-(--brand-500) px-3 py-1 text-white"
            >
              {language === 'ar' ? 'منصة التلاوات' : 'Recitations'}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-(--line) bg-(--panel) p-3 md:grid-cols-[1fr_auto] md:p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            language === 'ar'
              ? 'ابحث باسم السورة أو رقمها...'
              : 'Search by surah name or number...'
          }
          className="w-full rounded-xl border border-(--line) bg-transparent px-4 py-3 text-sm outline-none transition focus:border-(--brand-500)"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--line) p-6 text-sm text-(--muted)">
          {language === 'ar' ? 'لا توجد سور مطابقة.' : 'No matching surahs found.'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((surah) => (
            <article
              key={surah.id}
              className="rounded-2xl border border-(--line) bg-(--panel) p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:p-5"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-(--brand-100) px-3 py-1 text-(--brand-700)">
                  {language === 'ar' ? `سورة ${surah.number}` : `Surah ${surah.number}`}
                </span>
                <span className="rounded-full border border-(--line) bg-(--bg) px-3 py-1 text-(--muted)">
                  {revelationLabel(surah.revelationPlace)}
                </span>
              </div>

              <p className="font-title text-2xl leading-tight text-(--text-strong)" dir="rtl">
                {surah.arabicName}
              </p>

              <p className="mt-2 text-sm text-(--muted)">{surah.englishName}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-(--muted)">
                <span className="rounded-full border border-(--line) bg-(--bg) px-3 py-1">
                  {language === 'ar'
                    ? `عدد الآيات: ${surah.versesCount}`
                    : `Verses: ${surah.versesCount}`}
                </span>
                <span className="rounded-full border border-(--line) bg-(--bg) px-3 py-1">
                  {language === 'ar'
                    ? `${surah.hasBismillah ? 'تبدأ بالبسملة' : 'لا تبدأ بالبسملة'}`
                    : `${surah.hasBismillah ? 'Begins with Bismillah' : 'No Bismillah'}`}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-(--muted)">
                  {language === 'ar'
                    ? `ترتيب النزول: ${surah.revelationOrder}`
                    : `Revelation order: ${surah.revelationOrder}`}
                </span>
                <Link
                  to={`/ayat/${surah.number}`}
                  className="rounded-lg bg-(--brand-500) px-3 py-2 text-xs font-semibold text-white"
                >
                  {language === 'ar' ? 'عرض السورة' : 'Open surah'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
