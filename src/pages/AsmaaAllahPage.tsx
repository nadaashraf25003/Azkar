import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSettings } from '../context/SettingsContext'

interface AsmaaItem {
  id: number
  nameAr: string
  transliteration: string
  meaningAr: string
  meaningEn: string
}

const ALL_ASMAA_AUDIO_URL = 'https://server8.mp3quran.net/afs/099.mp3'

async function fetchAsmaaAllah(): Promise<AsmaaItem[]> {
  const response = await fetch('/data/asmaa-allah.json')

  if (!response.ok) {
    throw new Error('Failed to load Asmaa Allah data')
  }

  return (await response.json()) as AsmaaItem[]
}

export function AsmaaAllahPage() {
  const { language } = useSettings()
  const [search, setSearch] = useState('')
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['asmaa-allah'],
    queryFn: fetchAsmaaAllah,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const filtered = useMemo(() => {
    if (!data) {
      return []
    }

    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return data
    }

    return data.filter((item) => {
      const haystack = `${item.nameAr} ${item.transliteration} ${item.meaningAr} ${item.meaningEn}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [data, search])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  const playAllNames = () => {
    if (!data || data.length === 0) {
      return
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(ALL_ASMAA_AUDIO_URL)
      audioRef.current.onended = () => {
        setIsPlayingAll(false)
      }
      audioRef.current.onerror = () => {
        setIsPlayingAll(false)
      }
    }

    void audioRef.current.play().then(() => {
      setIsPlayingAll(true)
    }).catch(() => {
      setIsPlayingAll(false)
    })
  }

  const stopAllNames = () => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlayingAll(false)
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">{language === 'ar' ? 'جارٍ تحميل الأسماء...' : 'Loading names...'}</p>
  }

  if (isError || !data) {
    return <p className="text-sm text-[var(--warn)]">{language === 'ar' ? 'تعذر تحميل أسماء الله الحسنى.' : 'Failed to load Asmaa Allah.'}</p>
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-600)]">
          {language === 'ar' ? 'ذكر ومعرفة' : 'Remembrance and Learning'}
        </p>
        <h1 className="mt-1 font-title text-3xl text-[var(--text-strong)] sm:text-4xl">
          {language === 'ar' ? 'أسماء الله الحسنى' : 'Asmaa Allah Al-Husna'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'ar'
            ? 'تصفح أسماء الله الحسنى مع معانٍ مختصرة للقراءة والتدبر.'
            : 'Browse the Beautiful Names of Allah with concise meanings for reflection.'}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 md:p-4">
        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={language === 'ar' ? 'ابحث بالاسم أو المعنى...' : 'Search by name or meaning...'}
            className="w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-500)]"
          />

          {isPlayingAll ? (
            <button
              type="button"
              onClick={stopAllNames}
              className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--warn)]"
            >
              {language === 'ar' ? 'إيقاف تشغيل جميع الأسماء' : 'Stop all names'}
            </button>
          ) : (
            <button
              type="button"
              onClick={playAllNames}
              className="rounded-xl bg-[var(--brand-500)] px-4 py-3 text-sm font-semibold text-white"
            >
              {language === 'ar' ? 'تشغيل جميع الأسماء' : 'Play all names'}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {language === 'ar' ? `عدد النتائج: ${filtered.length}` : `Results: ${filtered.length}`}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          {language === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No matching names found.'}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-[var(--brand-100)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-700)]">
                  #{item.id}
                </span>
                <span className="text-xs font-medium text-[var(--muted)]">{item.transliteration}</span>
              </div>

              <h2 className="font-title text-3xl text-[var(--text-strong)]" dir="rtl">
                {item.nameAr}
              </h2>

              <p className="mt-2 text-sm text-[var(--text)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? item.meaningAr : item.meaningEn}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
