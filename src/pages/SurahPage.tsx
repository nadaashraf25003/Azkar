import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
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

interface QuranVerseApiItem {
  id: number
  verse_key: string
  text_uthmani: string
}

interface SurahDetailData {
  chapter: QuranChapterApiItem
  verses: QuranVerseApiItem[]
}

async function fetchSurahDetail(chapterNumber: number): Promise<SurahDetailData> {
  const [chapterResponse, versesResponse] = await Promise.all([
    fetch(`https://api.quran.com/api/v4/chapters/${chapterNumber}`),
    fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterNumber}`),
  ])

  if (!chapterResponse.ok || !versesResponse.ok) {
    throw new Error('Failed to load surah detail')
  }

  const chapterData = (await chapterResponse.json()) as { chapter: QuranChapterApiItem }
  const versesData = (await versesResponse.json()) as { verses: QuranVerseApiItem[] }

  return {
    chapter: chapterData.chapter,
    verses: versesData.verses,
  }
}

export function SurahPage() {
  const { language } = useSettings()
  const [showFullText, setShowFullText] = useState(false)
  const params = useParams<{ chapterNumber: string }>()
  const chapterNumber = Number(params.chapterNumber)
  const isValidChapterNumber = Number.isInteger(chapterNumber) && chapterNumber >= 1 && chapterNumber <= 114

  const { data, isLoading, isError } = useQuery({
    queryKey: ['surah-detail', chapterNumber],
    queryFn: () => fetchSurahDetail(chapterNumber),
    enabled: isValidChapterNumber,
    staleTime: Infinity,
  })

  const fullText = useMemo(() => {
    if (!data) {
      return ''
    }

    return data.verses.map((verse) => verse.text_uthmani.trim()).join('، ')
  }, [data])

  const revelationLabel = (place: 'makkah' | 'madinah') => {
    if (language === 'ar') {
      return place === 'makkah' ? 'مكية' : 'مدنية'
    }

    return place === 'makkah' ? 'Makkah' : 'Madinah'
  }

  if (!isValidChapterNumber) {
    return (
      <section className="rounded-3xl border border-(--line) bg-(--panel) p-6 text-sm text-(--muted)">
        {language === 'ar' ? 'رقم السورة غير صحيح.' : 'Invalid surah number.'}
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-(--line) bg-(--panel) p-6 text-sm text-(--muted)">
        {language === 'ar' ? 'جارٍ تحميل السورة...' : 'Loading surah...'}
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="rounded-3xl border border-(--line) bg-(--panel) p-6 text-sm text-(--warn)">
        {language === 'ar' ? 'تعذر تحميل السورة.' : 'Failed to load surah.'}
      </section>
    )
  }

  const { chapter, verses } = data

  return (
    <section className="space-y-5 md:space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-(--line) bg-(--panel) p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(37,99,235,0.24),transparent_38%),radial-gradient(circle_at_90%_20%,rgba(14,165,233,0.16),transparent_32%)]" />
        <div className="relative space-y-4">
          <div className="space-y-3">
            <Link to="/ayat" className="inline-flex items-center gap-2 text-sm font-semibold text-(--brand-600)">
              <span aria-hidden>←</span>
              {language === 'ar' ? 'العودة إلى السور' : 'Back to surahs'}
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-(--brand-100) px-3 py-1 text-(--brand-700)">
                {language === 'ar' ? `سورة ${chapter.id}` : `Surah ${chapter.id}`}
              </span>
              <span className="rounded-full border border-(--line) bg-(--bg) px-3 py-1 text-(--muted)">
                {revelationLabel(chapter.revelation_place)}
              </span>
              <span className="rounded-full border border-(--line) bg-(--bg) px-3 py-1 text-(--muted)">
                {language === 'ar' ? `الآيات: ${chapter.verses_count}` : `Verses: ${chapter.verses_count}`}
              </span>
            </div>
            <h1 className="font-title text-4xl leading-tight text-(--text-strong) md:text-5xl" dir="rtl">
              {chapter.name_arabic}
            </h1>
            <p className="text-sm text-(--muted) md:text-base">{chapter.translated_name?.name ?? chapter.name_simple}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowFullText((prev) => !prev)}
            className="w-fit rounded-xl border border-(--line) bg-(--bg) px-4 py-2 text-sm font-semibold text-(--text) transition hover:border-(--brand-500)"
          >
            {showFullText
              ? language === 'ar'
                ? 'إخفاء النص الكامل'
                : 'Hide full text'
              : language === 'ar'
                ? 'عرض النص الكامل'
                : 'Show full text'}
          </button>
        </div>
      </div>

      {showFullText ? (
        <article className="rounded-3xl border border-(--line) bg-(--panel) p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-(--brand-600)">
            {language === 'ar' ? 'النص الكامل' : 'Full text'}
          </p>
          <div className="mt-3 rounded-2xl border border-(--line) bg-(--bg) p-4 md:p-5">
            <p className="text-right font-title text-2xl leading-loose text-(--text-strong) md:text-3xl" dir="rtl">
              {fullText}
            </p>
          </div>
        </article>
      ) : null}

      <div className="rounded-3xl border border-(--line) bg-(--panel) p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-(--brand-600)">
          {language === 'ar' ? 'آيات السورة' : 'Verses'}
        </p>
        <div className="mt-4 grid gap-3">
          {verses.map((verse) => (
            <article
              key={verse.id}
              className="rounded-2xl border border-(--line) bg-(--bg) p-4 shadow-sm md:p-5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-(--brand-100) px-3 py-1 text-(--brand-700)">
                  {verse.verse_key}
                </span>
                <span className="rounded-full border border-(--line) px-3 py-1 text-(--muted)">
                  {language === 'ar' ? 'آية' : 'Verse'}
                </span>
              </div>
              <p className="text-right font-title text-2xl leading-loose text-(--text-strong)" dir="rtl">
                {verse.text_uthmani}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
